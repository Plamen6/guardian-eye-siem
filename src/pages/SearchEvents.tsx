import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { 
  Search as SearchIcon, 
  Clock,
  Filter,
  Download,
  Play,
  BarChart3,
  Eye,
  ChevronRight,
  TrendingUp,
  Activity,
  Globe,
  User,
  Server,
  Shield,
  Copy,
  ExternalLink,
  Maximize2
} from 'lucide-react';
import { mockEvents, getSeverityBadgeClass } from '@/lib/mockData';
import type { NormalizedEvent } from '@/lib/types';
import { SearchTimeSelector } from '@/components/search/SearchTimeSelector';
import { SearchQueryBuilder } from '@/components/search/SearchQueryBuilder';
import { SearchFacets } from '@/components/search/SearchFacets';
import { SearchHistogram } from '@/components/search/SearchHistogram';
import { SearchResultsTable } from '@/components/search/SearchResultsTable';
import { EventDetailDrawer } from '@/components/search/EventDetailDrawer';

const SearchEvents = () => {
  const [queryString, setQueryString] = useState('');
  const [timeRange, setTimeRange] = useState('last-24h');
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [results, setResults] = useState<NormalizedEvent[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStats, setSearchStats] = useState({ total: 0, took: 0, eps: 0 });
  const [selectedEvent, setSelectedEvent] = useState<NormalizedEvent | null>(null);
  const [isEventDrawerOpen, setIsEventDrawerOpen] = useState(false);
  const [facetFilters, setFacetFilters] = useState<Record<string, string[]>>({});
  const [savedSearches, setSavedSearches] = useState<Array<{ name: string; query: string; filters: any }>>([]);

  // Mock ECS-like event data
  const enhancedMockEvents = useMemo(() => {
    return mockEvents.map(event => ({
      ...event,
      '@timestamp': event.timestamp,
      'event.id': event.event.id,
      'event.dataset': event.event.dataset,
      'event.severity': event.event.severity,
      'event.action': event.event.action,
      'host.name': event.host.name,
      'host.ip': event.host.ip,
      'user.name': event.user?.name,
      'source.ip': event.source?.ip,
      'source.port': event.source?.port,
      'destination.ip': event.destination?.ip,
      'destination.port': event.destination?.port,
      'process.name': event.process?.name,
      'rule.name': `Rule-${Math.floor(Math.random() * 100)}`,
      'rule.id': `rule-${event.id}`,
      'risk.score': Math.floor(Math.random() * 100),
      tags: ['auth', 'network', 'process'].slice(0, Math.floor(Math.random() * 3) + 1),
      message: `Security event from ${event.host.name}: ${event.event.action}`,
    }));
  }, []);

  // Compute facet data
  const facetData = useMemo(() => {
    const facets = {
      'event.dataset': {},
      'host.name': {},
      'source.ip': {},
      'user.name': {},
      'rule.name': {},
      'event.severity': {}
    };

    results.forEach(event => {
      Object.keys(facets).forEach(field => {
        const value = getNestedValue(event, field);
        if (value) {
          facets[field][value] = (facets[field][value] || 0) + 1;
        }
      });
    });

    return Object.entries(facets).map(([field, counts]) => ({
      field,
      values: Object.entries(counts)
        .map(([value, count]) => ({ value, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    }));
  }, [results]);

  // Histogram data
  const histogramData = useMemo(() => {
    const buckets = 24; // 24 hours
    const now = new Date();
    const interval = 60 * 60 * 1000; // 1 hour in ms
    
    return Array.from({ length: buckets }, (_, i) => {
      const bucketTime = new Date(now.getTime() - (buckets - i - 1) * interval);
      const eventsInBucket = results.filter(event => {
        const eventTime = new Date(event.timestamp);
        return eventTime >= bucketTime && eventTime < new Date(bucketTime.getTime() + interval);
      });

      const datasetCounts = eventsInBucket.reduce((acc, event) => {
        const dataset = event.event.dataset;
        acc[dataset] = (acc[dataset] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        time: bucketTime.toISOString(),
        total: eventsInBucket.length,
        ...datasetCounts
      };
    });
  }, [results]);

  const handleSearch = async (query?: string, filters?: Record<string, string[]>) => {
    setIsSearching(true);
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const searchQuery = query || queryString;
    const activeFilters = filters || facetFilters;
    
    let filteredResults = enhancedMockEvents;
    
    // Apply text query
    if (searchQuery) {
      // Support KQL-like syntax
      if (searchQuery.includes(':')) {
        const parts = searchQuery.split(' AND ').map(p => p.trim());
        filteredResults = filteredResults.filter(event => {
          return parts.every(part => {
            if (part.includes(':')) {
              const [field, value] = part.split(':').map(s => s.trim().replace(/"/g, ''));
              const eventValue = getNestedValue(event, field);
              if (value.includes('*')) {
                const regex = new RegExp(value.replace(/\*/g, '.*'), 'i');
                return regex.test(String(eventValue || ''));
              }
              return String(eventValue || '').toLowerCase().includes(value.toLowerCase());
            }
            return JSON.stringify(event).toLowerCase().includes(part.toLowerCase());
          });
        });
      } else {
        filteredResults = filteredResults.filter(event =>
          JSON.stringify(event).toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    }

    // Apply facet filters
    Object.entries(activeFilters).forEach(([field, values]) => {
      if (values.length > 0) {
        filteredResults = filteredResults.filter(event => {
          const eventValue = getNestedValue(event, field);
          return values.includes(String(eventValue || ''));
        });
      }
    });

    setResults(filteredResults.slice(0, 10000));
    setSearchStats({ 
      total: filteredResults.length, 
      took: 156 + Math.floor(Math.random() * 300),
      eps: Math.round(filteredResults.length / 3600 * 100) / 100
    });
    setIsSearching(false);
  };

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const handleEventClick = (event: NormalizedEvent) => {
    setSelectedEvent(event);
    setIsEventDrawerOpen(true);
  };

  const handleFacetFilter = (field: string, value: string) => {
    const newFilters = { ...facetFilters };
    if (!newFilters[field]) newFilters[field] = [];
    
    if (newFilters[field].includes(value)) {
      newFilters[field] = newFilters[field].filter(v => v !== value);
      if (newFilters[field].length === 0) delete newFilters[field];
    } else {
      newFilters[field] = [...newFilters[field], value];
    }
    
    setFacetFilters(newFilters);
    handleSearch(queryString, newFilters);
  };

  const handleTimeRangeChange = (range: string, startDate?: Date, endDate?: Date) => {
    setTimeRange(range);
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    handleSearch();
  };

  const saveSearch = () => {
    const name = prompt('Enter a name for this saved search:');
    if (name) {
      setSavedSearches([...savedSearches, {
        name,
        query: queryString,
        filters: facetFilters
      }]);
    }
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `siem_events_${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  useEffect(() => {
    // Auto-search on load
    handleSearch('', {});
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Security Event Search</h1>
            <p className="text-sm text-muted-foreground">
              Advanced SIEM search and analytics platform
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={saveSearch}>
              Save Search
            </Button>
            <Button variant="outline" size="sm" onClick={exportResults}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Search Controls */}
      <div className="p-4 border-b bg-card">
        <div className="space-y-4">
          {/* Query Bar */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder='KQL query: event.dataset:"auth" AND (status:fail OR action:deny)'
                value={queryString}
                onChange={(e) => setQueryString(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="font-mono"
              />
            </div>
            <Button onClick={() => handleSearch()} disabled={isSearching}>
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              ) : (
                <SearchIcon className="w-4 h-4 mr-2" />
              )}
              Search
            </Button>
          </div>

          {/* Time Selector */}
          <SearchTimeSelector
            timeRange={timeRange}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
            onChange={handleTimeRangeChange}
          />

          {/* Active Filters */}
          {Object.entries(facetFilters).length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filters:</span>
              {Object.entries(facetFilters).map(([field, values]) =>
                values.map(value => (
                  <Badge 
                    key={`${field}:${value}`} 
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleFacetFilter(field, value)}
                  >
                    {field}:{value} ×
                  </Badge>
                ))
              )}
            </div>
          )}

          {/* Stats */}
          {searchStats.total > 0 && (
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>{searchStats.total.toLocaleString()} events found</span>
              <span>Query took {searchStats.took}ms</span>
              <span>{searchStats.eps} EPS</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel - Facets */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <SearchFacets 
              facets={facetData}
              activeFilters={facetFilters}
              onFilter={handleFacetFilter}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Main Panel - Results */}
          <ResizablePanel defaultSize={80}>
            <div className="flex flex-col h-full">
              {/* Histogram */}
              <div className="h-32 border-b">
                <SearchHistogram 
                  data={histogramData}
                  onTimeRangeSelect={(start, end) => {
                    setCustomStartDate(start);
                    setCustomEndDate(end);
                    setTimeRange('custom');
                    handleSearch();
                  }}
                />
              </div>

              {/* Results Table */}
              <div className="flex-1">
                <SearchResultsTable
                  events={results}
                  onEventClick={handleEventClick}
                  isLoading={isSearching}
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Event Detail Drawer */}
      <EventDetailDrawer
        event={selectedEvent}
        open={isEventDrawerOpen}
        onOpenChange={setIsEventDrawerOpen}
        onPivot={(field, value) => {
          setQueryString(`${field}:"${value}"`);
          handleSearch(`${field}:"${value}"`);
          setIsEventDrawerOpen(false);
        }}
      />
    </div>
  );
};

export default SearchEvents;