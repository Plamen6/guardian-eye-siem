import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Crosshair, 
  Target, 
  BookOpen, 
  Play,
  Save,
  Share2,
  Clock,
  TrendingUp,
  Eye,
  Filter,
  Download
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const mockHuntingQueries = [
  {
    id: '1',
    name: 'Lateral Movement Detection',
    category: 'Attack Techniques',
    description: 'Detect potential lateral movement using admin shares',
    query: 'event.action:login AND user.name:admin* AND source.ip!=destination.ip',
    author: 'analyst_alice',
    created: '2024-01-15',
    last_run: '2 hours ago',
    results: 23,
    severity: 'high'
  },
  {
    id: '2',
    name: 'Suspicious PowerShell Activity',
    category: 'Process Analysis',
    description: 'Identify potentially malicious PowerShell execution patterns',
    query: 'process.name:powershell.exe AND process.command_line:*-EncodedCommand*',
    author: 'analyst_bob',
    created: '2024-01-18',
    last_run: '30 minutes ago',
    results: 8,
    severity: 'medium'
  },
  {
    id: '3',
    name: 'Rare Process Execution',
    category: 'Behavioral Analysis',
    description: 'Find processes rarely executed in the environment',
    query: 'event.dataset:process AND NOT process.name:(explorer.exe OR chrome.exe OR notepad.exe)',
    author: 'analyst_charlie',
    created: '2024-01-20',
    last_run: '1 hour ago',
    results: 156,
    severity: 'low'
  }
];

const mockHuntingBooks = [
  {
    id: '1',
    title: 'MITRE ATT&CK Hunt Queries',
    description: 'Comprehensive hunting queries mapped to MITRE ATT&CK framework',
    queries: 45,
    category: 'Framework'
  },
  {
    id: '2',
    title: 'Living Off The Land Techniques',
    description: 'Detect abuse of legitimate system tools for malicious purposes',
    queries: 28,
    category: 'Techniques'
  },
  {
    id: '3',
    title: 'APT Group Indicators',
    description: 'Hunt for specific Advanced Persistent Threat group behaviors',
    queries: 67,
    category: 'Threat Groups'
  }
];

const mockHuntingSessions = [
  {
    id: '1',
    name: 'Insider Threat Investigation',
    hypothesis: 'Privileged user accessing unusual data volumes',
    status: 'active',
    started: '2024-01-21 08:30:00',
    queries_run: 12,
    findings: 3,
    analyst: 'analyst_alice'
  },
  {
    id: '2',
    name: 'C2 Communication Hunt',
    hypothesis: 'Beaconing traffic to external domains',
    status: 'completed',
    started: '2024-01-20 14:15:00',
    queries_run: 8,
    findings: 1,
    analyst: 'analyst_bob'
  },
  {
    id: '3',
    name: 'Malware Persistence Hunt',
    hypothesis: 'Malware establishing persistence mechanisms',
    status: 'paused',
    started: '2024-01-21 11:00:00',
    queries_run: 5,
    findings: 0,
    analyst: 'analyst_charlie'
  }
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'status-critical';
    case 'high': return 'status-high';
    case 'medium': return 'status-medium';
    case 'low': return 'status-low';
    default: return 'status-info';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'status-low';
    case 'completed': return 'status-info';
    case 'paused': return 'status-medium';
    default: return 'status-info';
  }
};

const ThreatHunting = () => {
  const [activeQuery, setActiveQuery] = useState('');
  const [queryName, setQueryName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Threat Hunting</h1>
          <p className="text-muted-foreground mt-1">
            Proactive threat detection and investigation platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Hunt Library
          </Button>
          <Button className="gap-2">
            <Crosshair className="h-4 w-4" />
            New Hunt
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Active Hunts</p>
                <p className="text-white text-2xl font-bold">8</p>
              </div>
              <Target className="h-8 w-8 text-white/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Saved Queries</p>
                <p className="text-foreground text-2xl font-bold">156</p>
              </div>
              <Search className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Findings Today</p>
                <p className="text-foreground text-2xl font-bold">12</p>
              </div>
              <Eye className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Hunt Success Rate</p>
                <p className="text-foreground text-2xl font-bold">67%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="builder" className="gap-2">
            <Search className="h-4 w-4" />
            Query Builder
          </TabsTrigger>
          <TabsTrigger value="library" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Query Library
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2">
            <Target className="h-4 w-4" />
            Hunt Sessions
          </TabsTrigger>
          <TabsTrigger value="playbooks" className="gap-2">
            <Crosshair className="h-4 w-4" />
            Hunt Playbooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Query Builder</CardTitle>
              <CardDescription>
                Build and execute custom threat hunting queries across your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Query Name</label>
                  <Input
                    placeholder="Enter query name..."
                    value={queryName}
                    onChange={(e) => setQueryName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attack">Attack Techniques</SelectItem>
                      <SelectItem value="behavioral">Behavioral Analysis</SelectItem>
                      <SelectItem value="process">Process Analysis</SelectItem>
                      <SelectItem value="network">Network Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Query</label>
                <Textarea
                  placeholder="Enter your hunting query (KQL syntax)..."
                  value={activeQuery}
                  onChange={(e) => setActiveQuery(e.target.value)}
                  className="min-h-[120px] font-mono text-sm"
                />
              </div>

              <div className="flex items-center gap-4">
                <Button className="gap-2">
                  <Play className="h-4 w-4" />
                  Execute Query
                </Button>
                <Button variant="outline" className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Query
                </Button>
                <Button variant="outline" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <div className="ml-auto text-sm text-muted-foreground">
                  Syntax: KQL (Kusto Query Language)
                </div>
              </div>

              {/* Query Examples */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Quick Examples:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="text-left h-auto p-3"
                    onClick={() => setActiveQuery('event.action:login AND event.outcome:failure | stats count by source.ip')}
                  >
                    <div className="text-xs">
                      <div className="font-medium">Failed Login Analysis</div>
                      <div className="text-muted-foreground">Count failed logins by IP</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-left h-auto p-3"
                    onClick={() => setActiveQuery('process.name:*.exe AND NOT process.parent.name:(explorer.exe OR services.exe)')}
                  >
                    <div className="text-xs">
                      <div className="font-medium">Suspicious Process Trees</div>
                      <div className="text-muted-foreground">Processes with unusual parents</div>
                    </div>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Query Results</CardTitle>
              <CardDescription>
                Results will appear here after executing a query
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground border border-dashed rounded-lg">
                Execute a query to see results
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Threat Hunting Query Library</CardTitle>
                  <CardDescription>
                    Pre-built and community-contributed hunting queries
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search queries..."
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
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Results</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockHuntingQueries.map((query) => (
                    <TableRow key={query.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{query.name}</div>
                          <div className="text-sm text-muted-foreground">{query.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{query.category}</Badge>
                      </TableCell>
                      <TableCell>{query.author}</TableCell>
                      <TableCell>{query.results}</TableCell>
                      <TableCell>{query.last_run}</TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(query.severity)}>
                          {query.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
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

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Hunt Sessions</CardTitle>
              <CardDescription>
                Ongoing and completed threat hunting investigations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hunt Name</TableHead>
                    <TableHead>Hypothesis</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Analyst</TableHead>
                    <TableHead>Queries</TableHead>
                    <TableHead>Findings</TableHead>
                    <TableHead>Started</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockHuntingSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{session.hypothesis}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{session.analyst}</TableCell>
                      <TableCell>{session.queries_run}</TableCell>
                      <TableCell>
                        <Badge variant={session.findings > 0 ? 'destructive' : 'secondary'}>
                          {session.findings}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{session.started}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="playbooks" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockHuntingBooks.map((book) => (
              <Card key={book.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{book.title}</CardTitle>
                  <CardDescription>{book.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {book.queries} queries
                    </div>
                    <Badge variant="outline">{book.category}</Badge>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Import Queries
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ThreatHunting;
