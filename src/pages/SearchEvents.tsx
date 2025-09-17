import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Download,
  Clock,
  Brain,
  Target,
  Zap,
  Shield,
  GitBranch,
  Users,
  Globe,
  Network,
  Cpu
} from 'lucide-react';
import { SearchTimeSelector } from '@/components/search/SearchTimeSelector';
import { SearchQueryBuilder } from '@/components/search/SearchQueryBuilder';
import { SearchFacets } from '@/components/search/SearchFacets';
import { SearchHistogram } from '@/components/search/SearchHistogram';
import { SearchResultsTable } from '@/components/search/SearchResultsTable';
import { EventDetailDrawer } from '@/components/search/EventDetailDrawer';
import { mockEvents } from '@/lib/mockData';
import type { NormalizedEvent } from '@/lib/types';

const SearchEvents = () => {
  const [query, setQuery] = useState('');
  const [timeRange, setTimeRange] = useState({ 
    start: new Date(Date.now() - 24 * 60 * 60 * 1000), 
    end: new Date() 
  });
  const [selectedFacets, setSelectedFacets] = useState<Record<string, string[]>>({});
  const [selectedEvent, setSelectedEvent] = useState<NormalizedEvent | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [events, setEvents] = useState<NormalizedEvent[]>(mockEvents);
  const [histogramData, setHistogramData] = useState<any[]>([]);
  
  // AI-powered search enhancements
  const [aiInsights, setAiInsights] = useState({
    correlation_score: 0.87,
    anomaly_detection: 0.34,
    threat_attribution: ['APT29', 'Lazarus'],
    behavioral_patterns: 5,
    risk_score: 0.72
  });
  
  // Advanced analytics
  const [timelineCorrelations] = useState([
    { id: 1, events: ['evt_001', 'evt_045', 'evt_089'], pattern: 'Lateral Movement Chain', confidence: 0.94, timeline: '15m' },
    { id: 2, events: ['evt_023', 'evt_067'], pattern: 'Privilege Escalation', confidence: 0.87, timeline: '5m' },
    { id: 3, events: ['evt_012', 'evt_034', 'evt_056'], pattern: 'Data Exfiltration Sequence', confidence: 0.91, timeline: '22m' }
  ]);
  
  const [threatActorAttribution] = useState([
    { actor: 'APT29', confidence: 0.89, techniques: ['T1055', 'T1021'], events: 12 },
    { actor: 'Lazarus', confidence: 0.76, techniques: ['T1087', 'T1003'], events: 8 },
    { actor: 'FIN7', confidence: 0.63, techniques: ['T1566', 'T1083'], events: 5 }
  ]);
  
  const [entityRiskScores] = useState([
    { entity: 'user:admin', type: 'user', risk: 85, anomalies: 3 },
    { entity: 'host:srv-db01', type: 'host', risk: 92, anomalies: 5 },
    { entity: 'ip:192.168.1.100', type: 'ip', risk: 67, anomalies: 2 }
  ]);

  // Generate facet counts from events
  const facetCounts = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {
      'event.dataset': {},
      'event.severity': {},
      'host.name': {},
      'user.name': {},
      'source.ip': {}
    };

    events.forEach((event) => {
      counts['event.dataset'][event.event.dataset] = (counts['event.dataset'][event.event.dataset] || 0) + 1;
      counts['event.severity'][event.event.severity || 'unknown'] = (counts['event.severity'][event.event.severity || 'unknown'] || 0) + 1;
      counts['host.name'][event.host.name] = (counts['host.name'][event.host.name] || 0) + 1;
      if (event.user?.name) counts['user.name'][event.user.name] = (counts['user.name'][event.user.name] || 0) + 1;
      if (event.source?.ip) counts['source.ip'][event.source.ip] = (counts['source.ip'][event.source.ip] || 0) + 1;
    });

    return counts;
  }, [events]);

  const filteredEvents = useMemo(() => {
    let filtered = events;
    
    Object.entries(selectedFacets).forEach(([field, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter(event => {
          const fieldValue = getNestedValue(event, field);
          return values.includes(fieldValue?.toString() || '');
        });
      }
    });

    if (query) {
      filtered = filtered.filter(event => 
        JSON.stringify(event).toLowerCase().includes(query.toLowerCase())
      );
    }

    return filtered;
  }, [events, selectedFacets, query]);

  function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  const handleSearch = async () => {
    setIsSearching(true);
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSearching(false);
  };

  const handleEventClick = (event: NormalizedEvent) => {
    setSelectedEvent(event);
  };

  const handleFacetChange = (field: string, values: string[]) => {
    setSelectedFacets(prev => ({
      ...prev,
      [field]: values
    }));
  };

  return (
    <div className="p-6 space-y-6 max-w-full overflow-x-hidden">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            AI-Enhanced Event Timeline
          </h1>
          <p className="text-muted-foreground mt-1">
            Next-generation search with ML correlation, threat attribution and behavioral analytics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">AI Analysis Active</span>
          </div>
          <Badge variant="outline" className="text-xs">
            <Brain className="w-3 h-3 mr-1" />
            AI Confidence: {(aiInsights.correlation_score * 100).toFixed(0)}%
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Search time: {isSearching ? 'Analyzing...' : '0.8s'}
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Alert className="border-l-4 border-l-blue-500">
          <Brain className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium">Correlation Engine</span>
              <Badge variant="outline" className="text-xs">
                {(aiInsights.correlation_score * 100).toFixed(0)}% accuracy
              </Badge>
            </div>
            {timelineCorrelations.length} active correlations detected
          </AlertDescription>
        </Alert>

        <Alert className="border-l-4 border-l-purple-500">
          <Target className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium">Threat Attribution</span>
              <Badge variant="outline" className="text-xs">
                {aiInsights.threat_attribution.length} actors
              </Badge>
            </div>
            APT groups: {aiInsights.threat_attribution.join(', ')}
          </AlertDescription>
        </Alert>

        <Alert className="border-l-4 border-l-orange-500">
          <Zap className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium">Anomaly Score</span>
              <Badge variant="outline" className="text-xs">
                {(aiInsights.anomaly_detection * 100).toFixed(0)}%
              </Badge>
            </div>
            {aiInsights.behavioral_patterns} behavioral patterns found
          </AlertDescription>
        </Alert>

        <Alert className="border-l-4 border-l-red-500">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium">Risk Assessment</span>
              <Badge variant="outline" className="text-xs">
                {(aiInsights.risk_score * 100).toFixed(0)}% risk
              </Badge>
            </div>
            Critical entities identified
          </AlertDescription>
        </Alert>
      </div>

      {/* Enhanced Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Enhanced Facets & Analytics Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <SearchFacets
            facets={facetCounts}
            selectedFacets={selectedFacets}
            onFacetChange={handleFacetChange}
            totalEvents={filteredEvents.length}
          />
          
          {/* Real-time Correlations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <GitBranch className="w-4 h-4 mr-2" />
                Live Correlations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {timelineCorrelations.slice(0, 3).map((corr) => (
                <div key={corr.id} className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-sm font-medium mb-1">{corr.pattern}</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {corr.events.length} events • {corr.timeline} timeline
                  </div>
                  <div className="flex justify-between items-center">
                    <Progress value={corr.confidence * 100} className="h-1 flex-1 mr-2" />
                    <span className="text-xs">{(corr.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Entity Risk Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Entity Risk
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {entityRiskScores.map((entity) => (
                <div key={entity.entity} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium">{entity.entity}</div>
                    <Badge variant={entity.risk > 80 ? 'destructive' : entity.risk > 60 ? 'secondary' : 'outline'} className="text-xs">
                      {entity.risk}%
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {entity.anomalies} anomalies detected
                  </div>
                  <Progress value={entity.risk} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Search Area */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          {/* Search Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SearchTimeSelector
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
            <SearchQueryBuilder
              query={query}
              onQueryChange={setQuery}
              onSearch={handleSearch}
              isSearching={isSearching}
            />
          </div>

          {/* Enhanced Analytics Tabs */}
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="timeline">Event Timeline</TabsTrigger>
              <TabsTrigger value="correlations">AI Correlations</TabsTrigger>
              <TabsTrigger value="attribution">Threat Attribution</TabsTrigger>
              <TabsTrigger value="behavioral">Behavioral Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-4">
              {/* Enhanced Histogram */}
              <SearchHistogram
                data={histogramData}
                onTimeRangeSelect={(start, end) => {
                  setTimeRange({ start, end });
                  handleSearch();
                }}
              />

              {/* Enhanced Results Table */}
              <SearchResultsTable
                events={filteredEvents}
                isLoading={isSearching}
                onEventClick={handleEventClick}
              />
            </TabsContent>

            <TabsContent value="correlations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Powered Event Correlations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {timelineCorrelations.map((corr) => (
                      <div key={corr.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Network className="h-5 w-5 text-purple-400" />
                            <div>
                              <div className="font-medium">{corr.pattern}</div>
                              <div className="text-xs text-muted-foreground">
                                {corr.events.length} correlated events • Timeline: {corr.timeline}
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                            {(corr.confidence * 100).toFixed(0)}% Confidence
                          </Badge>
                        </div>
                        <Progress value={corr.confidence * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attribution" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Threat Actor Attribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {threatActorAttribution.map((actor) => (
                      <div key={actor.actor} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Globe className="h-5 w-5 text-red-400" />
                            <div>
                              <div className="font-medium text-red-400">{actor.actor}</div>
                              <div className="text-xs text-muted-foreground">
                                {actor.events} attributed events
                              </div>
                            </div>
                          </div>
                          <Badge variant="destructive" className="text-xs">
                            {(actor.confidence * 100).toFixed(0)}% Attribution
                          </Badge>
                        </div>
                        <Progress value={actor.confidence * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="behavioral" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Behavioral Pattern Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <Users className="h-5 w-5 text-blue-400" />
                        <span className="font-medium">User Behavior</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-400">
                        {aiInsights.behavioral_patterns}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Anomalous patterns detected
                      </div>
                    </div>

                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <Cpu className="h-5 w-5 text-green-400" />
                        <span className="font-medium">System Behavior</span>
                      </div>
                      <div className="text-2xl font-bold text-green-400">
                        {(aiInsights.anomaly_detection * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Anomaly confidence
                      </div>
                    </div>

                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <Network className="h-5 w-5 text-purple-400" />
                        <span className="font-medium">Network Behavior</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-400">
                        {(aiInsights.correlation_score * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Correlation accuracy
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Event Detail Drawer */}
      <EventDetailDrawer
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
};

export default SearchEvents;