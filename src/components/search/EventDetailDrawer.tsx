import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Copy, 
  ExternalLink, 
  Globe, 
  Server, 
  User, 
  Shield, 
  Activity,
  Network,
  Eye,
  AlertTriangle,
  Clock,
  Hash,
  Database,
  Terminal,
  Search,
  TrendingUp,
  MapPin,
  Link
} from 'lucide-react';
import type { NormalizedEvent } from '@/lib/types';
import { getSeverityBadgeClass } from '@/lib/mockData';
import { format } from 'date-fns';

interface EventDetailDrawerProps {
  event: NormalizedEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPivot: (field: string, value: string) => void;
}

export const EventDetailDrawer = ({ event, open, onOpenChange, onPivot }: EventDetailDrawerProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!event) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handlePivot = (field: string, value: string) => {
    onPivot(field, value);
  };

  const riskScore = Math.floor(Math.random() * 100);
  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-destructive';
    if (score >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-screen top-0 right-0 left-auto mt-0 w-[600px] rounded-none">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <DrawerTitle>Event Details</DrawerTitle>
            <div className="flex items-center gap-2">
              <Badge 
                className={`${getSeverityBadgeClass(event.event.severity || 'informational')}`}
              >
                {event.event.severity?.toUpperCase() || 'INFO'}
              </Badge>
              <Badge variant="outline">
                Risk: <span className={getRiskColor(riskScore)}>{riskScore}</span>
              </Badge>
            </div>
          </div>
          
          {/* Event Header */}
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{format(event.timestamp, 'PPpp')}</span>
              <Badge variant="outline" className="ml-auto">
                {event.event.dataset}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Server className="w-4 h-4" />
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-sm"
                  onClick={() => handlePivot('host.name', event.host.name)}
                >
                  {event.host.name}
                </Button>
              </div>
              
              {event.user?.name && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-sm"
                    onClick={() => handlePivot('user.name', event.user!.name)}
                  >
                    {event.user.name}
                  </Button>
                </div>
              )}
              
              {event.source?.ip && (
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-sm font-mono"
                    onClick={() => handlePivot('source.ip', event.source!.ip)}
                  >
                    {event.source.ip}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
              <TabsTrigger value="overview" className="rounded-none">Overview</TabsTrigger>
              <TabsTrigger value="json" className="rounded-none">Raw JSON</TabsTrigger>
              <TabsTrigger value="context" className="rounded-none">Context</TabsTrigger>
              <TabsTrigger value="correlations" className="rounded-none">Correlations</TabsTrigger>
              <TabsTrigger value="timeline" className="rounded-none">Timeline</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="overview" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    {/* Key Fields */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          Key Event Data
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Event ID:</span>
                            <div className="flex items-center gap-2">
                              <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                {event.event.id}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(event.event.id)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <span className="text-muted-foreground">Action:</span>
                            <p className="font-medium capitalize">{event.event.action || 'N/A'}</p>
                          </div>
                          
                          <div>
                            <span className="text-muted-foreground">Dataset:</span>
                            <Badge variant="outline">{event.event.dataset}</Badge>
                          </div>
                          
                          <div>
                            <span className="text-muted-foreground">Outcome:</span>
                            <Badge 
                              variant={event.event.outcome === 'success' ? 'default' : 'destructive'}
                            >
                              {event.event.outcome || 'unknown'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Network Information */}
                    {(event.source?.ip || event.destination?.ip) && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Network className="w-4 h-4" />
                            Network
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            {event.source?.ip && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Source:</span>
                                <div className="flex items-center gap-2">
                                  <code className="font-mono">{event.source.ip}:{event.source.port || 'N/A'}</code>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePivot('source.ip', event.source!.ip)}
                                  >
                                    <Search className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                            
                            {event.destination?.ip && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Destination:</span>
                                <div className="flex items-center gap-2">
                                  <code className="font-mono">{event.destination.ip}:{event.destination.port || 'N/A'}</code>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePivot('destination.ip', event.destination!.ip)}
                                  >
                                    <Search className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Process Information */}
                    {event.process?.name && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Terminal className="w-4 h-4" />
                            Process
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Name:</span>
                              <div className="flex items-center gap-2">
                                <code className="font-mono">{event.process.name}</code>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePivot('process.name', event.process!.name)}
                                >
                                  <Search className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">PID:</span>
                              <code className="font-mono">{event.process.pid || 'N/A'}</code>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Quick Actions */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm" className="justify-start">
                            <Shield className="w-4 h-4 mr-2" />
                            Create Rule
                          </Button>
                          <Button variant="outline" size="sm" className="justify-start">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Create Alert
                          </Button>
                          <Button variant="outline" size="sm" className="justify-start">
                            <Eye className="w-4 h-4 mr-2" />
                            Add to Watchlist
                          </Button>
                          <Button variant="outline" size="sm" className="justify-start">
                            <Link className="w-4 h-4 mr-2" />
                            Create Case
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="json" className="h-full m-0">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Raw Event Data</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(event, null, 2))}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy JSON
                    </Button>
                  </div>
                  <ScrollArea className="h-[600px]">
                    <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify(event, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="context" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Enrichment Data
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">IP Geolocation:</span>
                            <p>United States, California, San Francisco</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">ASN:</span>
                            <p>AS13335 Cloudflare, Inc.</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Threat Intel:</span>
                            <Badge variant="outline" className="text-green-600">Clean</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="correlations" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Related Events</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Found 12 related events in the last hour from the same host.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="timeline" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Session Timeline</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Session-based event timeline and process tree visualization.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
};