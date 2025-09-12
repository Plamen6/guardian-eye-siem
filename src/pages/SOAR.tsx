import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bot, 
  Workflow, 
  Play, 
  Pause, 
  Settings2,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Code2,
  GitBranch
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

const mockPlaybooks = [
  {
    id: '1',
    name: 'Malware Response',
    description: 'Automated response to malware detection alerts',
    status: 'active',
    triggers: 3,
    last_run: '2 hours ago',
    success_rate: 94,
    avg_duration: '5.2 min',
    severity: 'critical'
  },
  {
    id: '2',
    name: 'Phishing Email Investigation',
    description: 'Investigate and contain phishing email incidents',
    status: 'active',
    triggers: 12,
    last_run: '30 minutes ago',
    success_rate: 87,
    avg_duration: '8.1 min',
    severity: 'high'
  },
  {
    id: '3',
    name: 'Brute Force Mitigation',
    description: 'Block and investigate brute force attacks',
    status: 'paused',
    triggers: 45,
    last_run: '1 day ago',
    success_rate: 98,
    avg_duration: '2.3 min',
    severity: 'medium'
  }
];

const mockAutomations = [
  {
    id: '1',
    name: 'IP Reputation Check',
    type: 'Enrichment',
    description: 'Query threat intelligence for IP reputation',
    executions: 2847,
    last_run: '5 minutes ago',
    status: 'running'
  },
  {
    id: '2',
    name: 'Email Quarantine',
    type: 'Response',
    description: 'Quarantine malicious emails automatically',
    executions: 156,
    last_run: '1 hour ago',
    status: 'running'
  },
  {
    id: '3',
    name: 'User Disable',
    type: 'Response',
    description: 'Disable compromised user accounts',
    executions: 23,
    last_run: '3 hours ago',
    status: 'running'
  }
];

const mockExecutions = [
  {
    id: '1',
    playbook: 'Malware Response',
    trigger: 'High severity malware alert',
    status: 'completed',
    duration: '4.2 min',
    started: '2024-01-21 10:15:00',
    completed: '2024-01-21 10:19:12',
    actions: 8,
    success_actions: 8
  },
  {
    id: '2',
    playbook: 'Phishing Email Investigation',
    trigger: 'Phishing email detected',
    status: 'running',
    duration: '2.1 min',
    started: '2024-01-21 10:45:00',
    completed: null,
    actions: 12,
    success_actions: 9
  },
  {
    id: '3',
    playbook: 'Brute Force Mitigation',
    trigger: 'SSH brute force detected',
    status: 'failed',
    duration: '1.8 min',
    started: '2024-01-21 09:30:00',
    completed: '2024-01-21 09:31:48',
    actions: 5,
    success_actions: 3
  }
];

const mockIntegrations = [
  {
    id: '1',
    name: 'VirusTotal',
    type: 'Threat Intelligence',
    status: 'connected',
    last_used: '2 minutes ago',
    requests: 1247
  },
  {
    id: '2',
    name: 'Active Directory',
    type: 'Identity Management',
    status: 'connected',
    last_used: '15 minutes ago',
    requests: 89
  },
  {
    id: '3',
    name: 'Firewall API',
    type: 'Network Security',
    status: 'error',
    last_used: '2 hours ago',
    requests: 45
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
    case 'running':
    case 'connected':
    case 'completed': return 'status-low';
    case 'paused': return 'status-medium';
    case 'failed':
    case 'error': return 'status-high';
    default: return 'status-info';
  }
};

const SOAR = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">SOAR Platform</h1>
          <p className="text-muted-foreground mt-1">
            Security Orchestration, Automation and Response
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Code2 className="h-4 w-4" />
            Playbook Builder
          </Button>
          <Button className="gap-2">
            <Bot className="h-4 w-4" />
            New Automation
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Active Playbooks</p>
                <p className="text-white text-2xl font-bold">12</p>
              </div>
              <Workflow className="h-8 w-8 text-white/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Executions Today</p>
                <p className="text-foreground text-2xl font-bold">89</p>
              </div>
              <Play className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Success Rate</p>
                <p className="text-foreground text-2xl font-bold">94%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Avg Response Time</p>
                <p className="text-foreground text-2xl font-bold">4.2m</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="playbooks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="playbooks" className="gap-2">
            <Workflow className="h-4 w-4" />
            Playbooks
          </TabsTrigger>
          <TabsTrigger value="automations" className="gap-2">
            <Bot className="h-4 w-4" />
            Automations
          </TabsTrigger>
          <TabsTrigger value="executions" className="gap-2">
            <Play className="h-4 w-4" />
            Executions
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <GitBranch className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="playbooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Playbooks</CardTitle>
              <CardDescription>
                Automated incident response workflows for common security scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Triggers</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Avg Duration</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPlaybooks.map((playbook) => (
                    <TableRow key={playbook.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{playbook.name}</div>
                          <div className="text-sm text-muted-foreground">{playbook.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(playbook.status)}>
                          {playbook.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{playbook.triggers}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={playbook.success_rate} className="w-16" />
                          <span className="text-sm">{playbook.success_rate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{playbook.avg_duration}</TableCell>
                      <TableCell>{playbook.last_run}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {playbook.status === 'active' ? (
                            <Button variant="outline" size="sm">
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm">
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Settings2 className="h-4 w-4" />
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

        <TabsContent value="automations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automated Actions</CardTitle>
              <CardDescription>
                Individual automation components used in security playbooks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Executions</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAutomations.map((automation) => (
                    <TableRow key={automation.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{automation.name}</div>
                          <div className="text-sm text-muted-foreground">{automation.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{automation.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(automation.status)}>
                          {automation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{automation.executions.toLocaleString()}</TableCell>
                      <TableCell>{automation.last_run}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings2 className="h-4 w-4" />
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

        <TabsContent value="executions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Playbook Executions</CardTitle>
              <CardDescription>
                Recent automation executions and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Playbook</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Actions</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockExecutions.map((execution) => (
                    <TableRow key={execution.id}>
                      <TableCell className="font-medium">{execution.playbook}</TableCell>
                      <TableCell className="max-w-xs truncate">{execution.trigger}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(execution.status)}>
                          {execution.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{execution.duration}</TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {execution.success_actions}/{execution.actions}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{execution.started}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {execution.completed || 'Running...'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>External Integrations</CardTitle>
              <CardDescription>
                Connected security tools and services for automation workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Integration</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requests</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockIntegrations.map((integration) => (
                    <TableRow key={integration.id}>
                      <TableCell className="font-medium">{integration.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{integration.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(integration.status)}>
                          {integration.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{integration.requests}</TableCell>
                      <TableCell>{integration.last_used}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Test
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings2 className="h-4 w-4" />
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
      </Tabs>
    </div>
  );
};

export default SOAR;
