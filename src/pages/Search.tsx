import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search as SearchIcon, 
  Calendar as CalendarIcon,
  Filter,
  Download,
  Plus,
  X,
  Clock,
  Database,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { mockEvents, getSeverityBadgeClass } from '@/lib/mockData';
import type { NormalizedEvent, SearchFilter } from '@/lib/types';

const Search = () => {
  const [queryString, setQueryString] = useState('');
  const [timeRange, setTimeRange] = useState('last-24h');
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [results, setResults] = useState<NormalizedEvent[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStats, setSearchStats] = useState({ total: 0, took: 0 });

  const timeRangeOptions = [
    { value: 'last-15m', label: 'Last 15 minutes' },
    { value: 'last-1h', label: 'Last hour' },
    { value: 'last-24h', label: 'Last 24 hours' },
    { value: 'last-7d', label: 'Last 7 days' },
    { value: 'last-30d', label: 'Last 30 days' },
    { value: 'custom', label: 'Custom range' }
  ];

  const fieldOptions = [
    'host.name', 'source.ip', 'destination.ip', 'user.name', 
    'event.action', 'event.dataset', 'event.severity', 'process.name',
    'http.request.method', 'dns.question.name'
  ];

  const operatorOptions = [
    { value: 'eq', label: 'equals' },
    { value: 'ne', label: 'not equals' },
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'does not contain' },
    { value: 'gt', label: 'greater than' },
    { value: 'lt', label: 'less than' },
    { value: 'in', label: 'in list' }
  ];

  const handleSearch = async () => {
    setIsSearching(true);
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock search - filter events based on query and filters
    let filteredResults = mockEvents;
    
    if (queryString) {
      filteredResults = filteredResults.filter(event =>
        JSON.stringify(event).toLowerCase().includes(queryString.toLowerCase())
      );
    }

    // Apply additional filters
    filters.forEach(filter => {
      filteredResults = filteredResults.filter(event => {
        const value = getNestedValue(event, filter.field);
        if (value === undefined) return false;
        
        switch (filter.operator) {
          case 'eq':
            return value === filter.value;
          case 'ne':
            return value !== filter.value;
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'not_contains':
            return !String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          default:
            return true;
        }
      });
    });

    setResults(filteredResults.slice(0, 100)); // Limit to 100 results
    setSearchStats({ 
      total: filteredResults.length, 
      took: 156 + Math.floor(Math.random() * 300)
    });
    setIsSearching(false);
  };

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const addFilter = () => {
    setFilters([...filters, { field: 'host.name', operator: 'eq', value: '' }]);
  };

  const updateFilter = (index: number, updates: Partial<SearchFilter>) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], ...updates };
    setFilters(newFilters);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `siem_search_${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Search Events</h1>
          <p className="text-muted-foreground mt-1">
            Search and analyze security events across your infrastructure
          </p>
        </div>
      </div>

      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Search Query</CardTitle>
          <CardDescription>
            Use simple text search or build advanced queries with filters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Query Builder Tabs */}
          <Tabs defaultValue="simple" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="simple">Simple Search</TabsTrigger>
              <TabsTrigger value="advanced">Query Builder</TabsTrigger>
            </TabsList>

            <TabsContent value="simple" className="space-y-4">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder="Search events... (e.g. 'failed login', '192.168.1.100', 'user:admin')"
                    value={queryString}
                    onChange={(e) => setQueryString(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <SearchIcon className="w-4 h-4 mr-2" />
                  )}
                  Search
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                Examples: <code>user.name:admin</code>, <code>source.ip:192.168.1.*</code>, <code>event.action:login AND event.outcome:failure</code>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              {/* Advanced Filters */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Search Filters</Label>
                  <Button variant="outline" size="sm" onClick={addFilter}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Filter
                  </Button>
                </div>

                {filters.map((filter, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Select 
                      value={filter.field} 
                      onValueChange={(value) => updateFilter(index, { field: value })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldOptions.map(field => (
                          <SelectItem key={field} value={field}>{field}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select 
                      value={filter.operator} 
                      onValueChange={(value: any) => updateFilter(index, { operator: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {operatorOptions.map(op => (
                          <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Value"
                      value={filter.value}
                      onChange={(e) => updateFilter(index, { value: e.target.value })}
                      className="flex-1"
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFilter(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {filters.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No filters added. Click "Add Filter" to create advanced search criteria.
                  </div>
                )}
              </div>

              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <SearchIcon className="w-4 h-4 mr-2" />
                )}
                Execute Search
              </Button>
            </TabsContent>
          </Tabs>

          {/* Time Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <Label>Time Range</Label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRangeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {timeRange === 'custom' && (
              <>
                <div>
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customStartDate ? format(customStartDate, "PPP") : "Pick start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customStartDate}
                        onSelect={setCustomStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customEndDate ? format(customEndDate, "PPP") : "Pick end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customEndDate}
                        onSelect={setCustomEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Search Results</CardTitle>
                <CardDescription>
                  Found {searchStats.total.toLocaleString()} events in {searchStats.took}ms
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={exportResults}>
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto siem-scrollbar">
              {results.map((event) => (
                <div
                  key={event.id}
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge 
                            className={`text-xs ${getSeverityBadgeClass(event.event.severity || 'informational')}`}
                          >
                            {event.event.severity?.toUpperCase() || 'INFO'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {event.event.dataset}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-mono">
                            {event.timestamp.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="text-sm">
                          <span className="font-medium">{event.host.name}</span>
                          {event.user?.name && (
                            <>
                              {' → '}
                              <span className="text-primary">{event.user.name}</span>
                            </>
                          )}
                          {event.event.action && (
                            <>
                              {' • '}
                              <span className="capitalize">{event.event.action}</span>
                            </>
                          )}
                        </div>
                        
                        <div className="text-xs text-muted-foreground mt-1 flex items-center space-x-4">
                          {event.source?.ip && (
                            <span>Src: {event.source.ip}</span>
                          )}
                          {event.destination?.ip && (
                            <span>Dst: {event.destination.ip}:{event.destination.port}</span>
                          )}
                          <span>ID: {event.event.id}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {results.length === 0 && searchStats.total === 0 && !isSearching && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No search performed yet</p>
            <p className="text-sm">Enter your search criteria and click Search to find events</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Search;
