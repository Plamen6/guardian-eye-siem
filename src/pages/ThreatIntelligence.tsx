import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  Globe, 
  AlertCircle, 
  Download, 
  RefreshCw,
  Search,
  TrendingUp,
  Eye,
  MapPin,
  Clock
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const mockIOCs = [
  {
    id: '1',
    type: 'IP',
    value: '45.33.32.156',
    threat_level: 'high',
    source: 'AlienVault',
    first_seen: '2024-01-15',
    last_seen: '2024-01-20',
    tags: ['botnet', 'c2'],
    confidence: 95
  },
  {
    id: '2',
    type: 'Domain',
    value: 'malicious.evil.com',
    threat_level: 'critical',
    source: 'VirusTotal',
    first_seen: '2024-01-18',
    last_seen: '2024-01-21',
    tags: ['malware', 'phishing'],
    confidence: 98
  },
  {
    id: '3',
    type: 'Hash',
    value: 'a1b2c3d4e5f6789012345678901234567890',
    threat_level: 'medium',
    source: 'Hybrid Analysis',
    first_seen: '2024-01-10',
    last_seen: '2024-01-19',
    tags: ['trojan', 'backdoor'],
    confidence: 87
  }
];

const mockFeeds = [
  {
    id: '1',
    name: 'AlienVault OTX',
    type: 'STIX/TAXII',
    status: 'active',
    last_updated: '2 hours ago',
    ioc_count: 45672,
    url: 'https://otx.alienvault.com/api/v1/indicators'
  },
  {
    id: '2', 
    name: 'VirusTotal Intelligence',
    type: 'API',
    status: 'active',
    last_updated: '15 minutes ago',
    ioc_count: 23891,
    url: 'https://www.virustotal.com/vtapi/v2/'
  },
  {
    id: '3',
    name: 'MISP Threat Feed',
    type: 'MISP',
    status: 'warning',
    last_updated: '6 hours ago',
    ioc_count: 12456,
    url: 'https://misp.example.com/events'
  }
];

const getThreatColor = (level: string) => {
  switch (level) {
    case 'critical': return 'status-critical';
    case 'high': return 'status-high';
    case 'medium': return 'status-medium';
    case 'low': return 'status-low';
    default: return 'status-info';
  }
};

const ThreatIntelligence = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Threat Intelligence</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and analyze threat indicators from multiple intelligence sources
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Sync Feeds
          </Button>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export IOCs
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Total IOCs</p>
                <p className="text-white text-2xl font-bold">82,019</p>
              </div>
              <Shield className="h-8 w-8 text-white/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Critical Threats</p>
                <p className="text-foreground text-2xl font-bold">156</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Active Feeds</p>
                <p className="text-foreground text-2xl font-bold">7</p>
              </div>
              <Globe className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Last Update</p>
                <p className="text-foreground text-2xl font-bold">2m</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="iocs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="iocs" className="gap-2">
            <Eye className="h-4 w-4" />
            IOC Database
          </TabsTrigger>
          <TabsTrigger value="feeds" className="gap-2">
            <Globe className="h-4 w-4" />
            Threat Feeds
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="hunting" className="gap-2">
            <Search className="h-4 w-4" />
            Threat Hunting
          </TabsTrigger>
        </TabsList>

        <TabsContent value="iocs" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Indicators of Compromise (IOCs)</CardTitle>
                  <CardDescription>
                    Known malicious indicators collected from threat intelligence sources
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search IOCs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-[250px]"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Threat Level</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>First Seen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockIOCs.map((ioc) => (
                    <TableRow key={ioc.id}>
                      <TableCell>
                        <Badge variant="outline">{ioc.type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {ioc.value}
                      </TableCell>
                      <TableCell>
                        <Badge className={getThreatColor(ioc.threat_level)}>
                          {ioc.threat_level}
                        </Badge>
                      </TableCell>
                      <TableCell>{ioc.source}</TableCell>
                      <TableCell>{ioc.confidence}%</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {ioc.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{ioc.first_seen}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feeds" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Threat Intelligence Feeds</CardTitle>
              <CardDescription>
                Configure and monitor external threat intelligence sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feed Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IOC Count</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockFeeds.map((feed) => (
                    <TableRow key={feed.id}>
                      <TableCell className="font-medium">{feed.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{feed.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            feed.status === 'active' ? 'status-low' : 
                            feed.status === 'warning' ? 'status-medium' : 'status-high'
                          }
                        >
                          {feed.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{feed.ioc_count.toLocaleString()}</TableCell>
                      <TableCell>{feed.last_updated}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            Configure
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Threat Trends</CardTitle>
                <CardDescription>IOC detection trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Threat trend visualization coming soon...
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Threat Categories</CardTitle>
                <CardDescription>Distribution of threat types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Threat category breakdown coming soon...
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hunting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Threat Hunting Queries</CardTitle>
              <CardDescription>
                Run advanced queries to hunt for threats in your environment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto p-4 text-left flex-col items-start">
                    <div className="font-medium">Suspicious DNS Queries</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Find DNS queries to known malicious domains
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 text-left flex-col items-start">
                    <div className="font-medium">C2 Communication</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Detect command and control traffic patterns
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 text-left flex-col items-start">
                    <div className="font-medium">IOC Matches</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Cross-reference events with IOC database
                    </div>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ThreatIntelligence;
