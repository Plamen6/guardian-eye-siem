import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Play, 
  Pause, 
  Search, 
  Filter, 
  Download,
  Eye,
  AlertCircle,
  Clock,
  Activity
} from 'lucide-react';
import { 
  mockEvents, 
  generateLiveEvent, 
  getSeverityColor, 
  getSeverityBadgeClass 
} from '@/lib/mockData';
import type { NormalizedEvent } from '@/lib/types';

const Stream = () => {
  const [events, setEvents] = useState<NormalizedEvent[]>(mockEvents.slice(0, 20));
  const [isLive, setIsLive] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<NormalizedEvent | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Simulate live events
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const newEvent = generateLiveEvent();
      setEvents(prev => [newEvent, ...prev.slice(0, 49)]); // Keep last 50 events
      
      // Auto scroll to top when new event arrives
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    }, 2000 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchFilter || 
      JSON.stringify(event).toLowerCase().includes(searchFilter.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || 
      event.event.severity === severityFilter;
    
    const matchesSource = sourceFilter === 'all' || 
      event.ingest?.source === sourceFilter;

    return matchesSearch && matchesSeverity && matchesSource;
  });

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString() + '.' + date.getMilliseconds().toString().padStart(3, '0');
  };

  const getEventIcon = (event: NormalizedEvent) => {
    const severity = event.event.severity;
    if (severity === 'critical' || severity === 'high') {
      return <AlertCircle className="h-4 w-4 text-red-400" />;
    }
    return <Activity className="h-4 w-4 text-blue-400" />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Event Stream</h1>
          <p className="text-muted-foreground mt-1">
            Real-time security event monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isLive ? 'default' : 'secondary'} className="live-pulse">
            {isLive ? <Play className="w-3 h-3 mr-1" /> : <Pause className="w-3 h-3 mr-1" />}
            {isLive ? 'LIVE' : 'PAUSED'}
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Filters */}
        <Card className="col-span-12 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="live-mode" 
                checked={isLive} 
                onCheckedChange={setIsLive}
              />
              <Label htmlFor="live-mode">Live Mode</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">Search Events</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search in events..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Severity</Label>
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

            <div className="space-y-2">
              <Label>Source Type</Label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="file">File Tail</SelectItem>
                  <SelectItem value="syslog">Syslog</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                <div>Showing: {filteredEvents.length}</div>
                <div>Total: {events.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Stream */}
        <div className="col-span-12 lg:col-span-9 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Event Stream</span>
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
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
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
                      
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                        <Eye className="h-4 w-4" />
                      </Button>
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
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Event Details</CardTitle>
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
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <Label className="text-sm font-medium">Severity</Label>
                    <Badge className={`mt-1 ${getSeverityBadgeClass(selectedEvent.event.severity || 'informational')}`}>
                      {selectedEvent.event.severity?.toUpperCase() || 'INFO'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Raw Event Data</Label>
                  <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-x-auto font-mono">
                    {JSON.stringify(selectedEvent, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Stream;