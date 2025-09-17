import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Search, 
  Filter, 
  Download,
  Eye,
  AlertCircle,
  Clock,
  Activity,
  Brain,
  Network,
  Zap,
  Target,
  Layers,
  GitBranch,
  Users,
  Globe,
  Shield,
  Cpu,
  Database,
  Wifi,
  Lock,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { 
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  Cell
} from 'recharts';
import { 
  mockEvents, 
  generateLiveEvent, 
  getSeverityColor, 
  getSeverityBadgeClass 
} from '@/lib/mockData';
import type { NormalizedEvent } from '@/lib/types';

const Stream = () => {
  const [events, setEvents] = useState<NormalizedEvent[]>(mockEvents.slice(0, 100));
  const [isLive, setIsLive] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<NormalizedEvent | null>(null);
  const [aiMode, setAiMode] = useState(true);
  const [clustering, setClustering] = useState(true);
  const [threatHuntingMode, setThreatHuntingMode] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // AI-powered event processing
  const [aiMetrics, setAiMetrics] = useState({
    classification_confidence: 0.94,
    correlation_score: 0.87,
    anomaly_detection: 0.23,
    behavioral_score: 0.78,
    threat_score: 0.65
  });

  // Event clustering and deduplication
  const [eventClusters, setEventClusters] = useState([
    { id: 'auth-failures', count: 47, pattern: 'Authentication failures from 192.168.1.100', severity: 'high' },
    { id: 'port-scans', count: 23, pattern: 'Port scanning activity detected', severity: 'medium' },
    { id: 'dns-requests', count: 156, pattern: 'Suspicious DNS requests to unknown domains', severity: 'medium' }
  ]);

  // Network flow data
  const [networkFlows, setNetworkFlows] = useState([
    { source: '192.168.1.10', dest: '10.0.0.50', protocol: 'TCP', port: 445, bytes: 1024, risk: 85 },
    { source: '10.0.0.100', dest: '8.8.8.8', protocol: 'UDP', port: 53, bytes: 512, risk: 15 },
    { source: '192.168.1.50', dest: '203.0.113.10', protocol: 'TCP', port: 80, bytes: 2048, risk: 45 }
  ]);

  // Real-time correlation engine
  const [correlations, setCorrelations] = useState([
    { id: 1, rule: 'Lateral Movement Detection', events: 5, confidence: 0.89, timeline: '5m' },
    { id: 2, rule: 'Data Exfiltration Pattern', events: 12, confidence: 0.76, timeline: '15m' },
    { id: 3, rule: 'Privilege Escalation Chain', events: 3, confidence: 0.92, timeline: '2m' }
  ]);

  // Simulate enhanced live events with AI processing
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const newEvent = generateLiveEvent();
      
      // AI-enhanced event processing
      const enhancedEvent = {
        ...newEvent,
        ai_classification: Math.random() > 0.7 ? 'malicious' : Math.random() > 0.5 ? 'suspicious' : 'benign',
        threat_score: Math.random() * 100,
        correlation_id: Math.random() > 0.8 ? `corr_${Date.now()}` : null,
        behavioral_anomaly: Math.random() > 0.9
      };

      setEvents(prev => [enhancedEvent, ...prev.slice(0, 199)]); // Keep last 200 events
      
      // Update AI metrics
      setAiMetrics(prev => ({
        ...prev,
        classification_confidence: Math.max(0.5, Math.min(1, prev.classification_confidence + (Math.random() - 0.5) * 0.1)),
        correlation_score: Math.max(0.5, Math.min(1, prev.correlation_score + (Math.random() - 0.5) * 0.1))
      }));

      // Auto scroll to top when new event arrives
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    }, 1500 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = !searchFilter || 
        JSON.stringify(event).toLowerCase().includes(searchFilter.toLowerCase());
      
      const matchesSeverity = severityFilter === 'all' || 
        event.event.severity === severityFilter;
      
      const matchesSource = sourceFilter === 'all' || 
        event.ingest?.source === sourceFilter;

      // AI mode filtering
      if (aiMode && searchFilter.includes('ai:')) {
        const aiQuery = searchFilter.replace('ai:', '').trim();
        if (aiQuery === 'malicious') return (event as any).ai_classification === 'malicious';
        if (aiQuery === 'anomalous') return (event as any).behavioral_anomaly === true;
      }

      return matchesSearch && matchesSeverity && matchesSource;
    });
  }, [events, searchFilter, severityFilter, sourceFilter, aiMode]);

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString() + '.' + date.getMilliseconds().toString().padStart(3, '0');
  };

  const getEventIcon = (event: NormalizedEvent) => {
    const severity = event.event.severity;
    if ((event as any).ai_classification === 'malicious') {
      return <Target className="h-4 w-4 text-red-400" />;
    }
    if ((event as any).behavioral_anomaly) {
      return <Brain className="h-4 w-4 text-purple-400" />;
    }
    if (severity === 'critical' || severity === 'high') {
      return <AlertCircle className="h-4 w-4 text-red-400" />;
    }
    return <Activity className="h-4 w-4 text-blue-400" />;
  };

  const getAIBadge = (event: NormalizedEvent) => {
    const classification = (event as any).ai_classification;
    if (classification === 'malicious') return <Badge variant="destructive" className="text-xs">AI: Malicious</Badge>;
    if (classification === 'suspicious') return <Badge variant="secondary" className="text-xs bg-orange-500/20 text-orange-400">AI: Suspicious</Badge>;
    return null;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            AI-Powered Live Stream
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time threat hunting and behavioral analysis
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isLive ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <Badge variant={isLive ? 'default' : 'secondary'} className="live-pulse">
              {isLive ? <Play className="w-3 h-3 mr-1" /> : <Pause className="w-3 h-3 mr-1" />}
              {isLive ? 'LIVE' : 'PAUSED'}
            </Badge>
          </div>
          <Badge variant="outline" className="text-xs">
            <Brain className="w-3 h-3 mr-1" />
            AI Confidence: {(aiMetrics.classification_confidence * 100).toFixed(0)}%
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* AI Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Classification</p>
                <p className="text-2xl font-bold text-blue-400">
                  {(aiMetrics.classification_confidence * 100).toFixed(0)}%
                </p>
              </div>
              <Brain className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Correlations</p>
                <p className="text-2xl font-bold text-purple-400">
                  {(aiMetrics.correlation_score * 100).toFixed(0)}%
                </p>
              </div>
              <Network className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Anomaly Score</p>
                <p className="text-2xl font-bold text-orange-400">
                  {(aiMetrics.anomaly_detection * 100).toFixed(0)}%
                </p>
              </div>
              <Zap className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Behavioral</p>
                <p className="text-2xl font-bold text-green-400">
                  {(aiMetrics.behavioral_score * 100).toFixed(0)}%
                </p>
              </div>
              <Users className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Threat Level</p>
                <p className="text-2xl font-bold text-red-400">
                  {(aiMetrics.threat_score * 100).toFixed(0)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Enhanced Filters & Controls */}
        <Card className="col-span-12 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              AI Controls & Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="live-mode" 
                  checked={isLive} 
                  onCheckedChange={setIsLive}
                />
                <Label htmlFor="live-mode">Live Mode</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="ai-mode" 
                  checked={aiMode} 
                  onCheckedChange={setAiMode}
                />
                <Label htmlFor="ai-mode">AI Enhancement</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="clustering" 
                  checked={clustering} 
                  onCheckedChange={setClustering}
                />
                <Label htmlFor="clustering">Event Clustering</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="threat-hunting" 
                  checked={threatHuntingMode} 
                  onCheckedChange={setThreatHuntingMode}
                />
                <Label htmlFor="threat-hunting">Threat Hunting</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">AI-Enhanced Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Try 'ai:malicious' or 'ai:anomalous'..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Use AI prefixes: ai:malicious, ai:anomalous, ai:suspicious
              </div>
            </div>

            <div className="space-y-2">
              <Label>Severity Filter</Label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="informational">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Correlations */}
            <div className="pt-4 border-t space-y-2">
              <Label className="text-sm font-medium">Active Correlations</Label>
              {correlations.slice(0, 2).map((corr) => (
                <div key={corr.id} className="p-2 bg-muted/30 rounded text-xs">
                  <div className="font-medium truncate">{corr.rule}</div>
                  <div className="text-muted-foreground">
                    {corr.events} events • {(corr.confidence * 100).toFixed(0)}% conf
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Showing: {filteredEvents.length}</div>
                <div>Total: {events.length}</div>
                <div>Clusters: {eventClusters.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="col-span-12 lg:col-span-9 space-y-4">
          <Tabs defaultValue="stream" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="stream">Live Stream</TabsTrigger>
              <TabsTrigger value="clusters">Event Clusters</TabsTrigger>
              <TabsTrigger value="network">Network Flows</TabsTrigger>
              <TabsTrigger value="correlations">Correlations</TabsTrigger>
            </TabsList>

            <TabsContent value="stream">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>AI-Enhanced Event Stream</span>
                    <Badge variant="outline" className="text-xs">
                      {filteredEvents.length} events
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    ref={scrollRef}
                    className="space-y-2 max-h-[600px] overflow-y-auto siem-scrollbar"
                  >
                    {filteredEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors relative"
                        onClick={() => setSelectedEvent(event)}
                      >
                        {/* AI Enhancement Indicator */}
                        {(event as any).ai_classification && (
                          <div className="absolute top-2 right-2">
                            {getAIBadge(event)}
                          </div>
                        )}

                        <div className="flex items-start justify-between pr-16">
                          <div className="flex items-start space-x-3 flex-1">
                            {getEventIcon(event)}
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
                                  {formatTimestamp(event.timestamp)}
                                </span>
                                {(event as any).correlation_id && (
                                  <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-400">
                                    <GitBranch className="w-3 h-3 mr-1" />
                                    Correlated
                                  </Badge>
                                )}
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
                                {(event as any).threat_score && (
                                  <span className="text-red-400">
                                    Threat: {((event as any).threat_score).toFixed(0)}%
                                  </span>
                                )}
                                <span>ID: {event.event.id}</span>
                              </div>

                              {/* AI Insights */}
                              {(event as any).behavioral_anomaly && (
                                <div className="mt-2 p-2 bg-purple-500/10 border border-purple-500/20 rounded text-xs">
                                  <div className="flex items-center space-x-1">
                                    <Brain className="w-3 h-3 text-purple-400" />
                                    <span className="text-purple-400 font-medium">Behavioral Anomaly Detected</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {filteredEvents.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No events match the current filters</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clusters">
              <Card>
                <CardHeader>
                  <CardTitle>Event Clusters & Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {eventClusters.map((cluster) => (
                      <div key={cluster.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Layers className="h-5 w-5 text-blue-400" />
                            <div>
                              <div className="font-medium">{cluster.pattern}</div>
                              <div className="text-xs text-muted-foreground">
                                {cluster.count} events clustered
                              </div>
                            </div>
                          </div>
                          <Badge className={getSeverityBadgeClass(cluster.severity)}>
                            {cluster.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <Progress value={Math.min(100, cluster.count)} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="network">
              <Card>
                <CardHeader>
                  <CardTitle>Live Network Flows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {networkFlows.map((flow, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Wifi className="h-5 w-5 text-cyan-400" />
                            <div>
                              <div className="font-mono text-sm">
                                {flow.source} → {flow.dest}:{flow.port}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {flow.protocol} • {flow.bytes} bytes
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${
                              flow.risk > 70 ? 'text-red-400' : 
                              flow.risk > 40 ? 'text-orange-400' : 'text-green-400'
                            }`}>
                              Risk: {flow.risk}%
                            </div>
                            <Progress value={flow.risk} className="h-2 w-24" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="correlations">
              <Card>
                <CardHeader>
                  <CardTitle>Real-time Correlations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {correlations.map((corr) => (
                      <div key={corr.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <GitBranch className="h-5 w-5 text-purple-400" />
                            <div>
                              <div className="font-medium">{corr.rule}</div>
                              <div className="text-xs text-muted-foreground">
                                {corr.events} related events • Timeline: {corr.timeline}
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
          </Tabs>
        </div>
      </div>

      {/* Enhanced Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-5xl max-h-[80vh] overflow-hidden">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <span>Enhanced Event Analysis</span>
                  {getAIBadge(selectedEvent)}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 overflow-y-auto siem-scrollbar">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
                  <TabsTrigger value="context">Context</TabsTrigger>
                  <TabsTrigger value="raw">Raw Data</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Event ID</Label>
                      <p className="font-mono text-sm mt-1">{selectedEvent.event.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Timestamp</Label>
                      <p className="text-sm mt-1">{selectedEvent.timestamp.toISOString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Dataset</Label>
                      <p className="text-sm mt-1">{selectedEvent.event.dataset}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Network Information</h4>
                      {selectedEvent.source?.ip && (
                        <div className="p-3 bg-muted/30 rounded">
                          <div className="text-sm font-medium">Source</div>
                          <div className="font-mono">{selectedEvent.source.ip}:{selectedEvent.source.port}</div>
                        </div>
                      )}
                      {selectedEvent.destination?.ip && (
                        <div className="p-3 bg-muted/30 rounded">
                          <div className="text-sm font-medium">Destination</div>
                          <div className="font-mono">{selectedEvent.destination.ip}:{selectedEvent.destination.port}</div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Host & User</h4>
                      <div className="p-3 bg-muted/30 rounded">
                        <div className="text-sm font-medium">Host</div>
                        <div>{selectedEvent.host.name}</div>
                      </div>
                      {selectedEvent.user?.name && (
                        <div className="p-3 bg-muted/30 rounded">
                          <div className="text-sm font-medium">User</div>
                          <div>{selectedEvent.user.name}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="ai-analysis" className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-4">AI Classification</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Classification</span>
                          <Badge className={
                            (selectedEvent as any).ai_classification === 'malicious' ? 'bg-red-500/20 text-red-400' :
                            (selectedEvent as any).ai_classification === 'suspicious' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-green-500/20 text-green-400'
                          }>
                            {(selectedEvent as any).ai_classification || 'benign'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Threat Score</span>
                          <span className="font-mono">
                            {((selectedEvent as any).threat_score || 0).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Behavioral Anomaly</span>
                          <span>{(selectedEvent as any).behavioral_anomaly ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-4">Risk Assessment</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Overall Risk</span>
                            <span>{((selectedEvent as any).threat_score || 0).toFixed(0)}%</span>
                          </div>
                          <Progress value={(selectedEvent as any).threat_score || 0} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="context" className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4">Event Context</h4>
                    <div className="p-4 bg-muted/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Context analysis and related events would appear here in a production system.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="raw" className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium">Raw Event Data</Label>
                    <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-x-auto font-mono">
                      {JSON.stringify(selectedEvent, null, 2)}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Stream;