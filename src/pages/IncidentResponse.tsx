import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertCircle, 
  FileText, 
  Clock, 
  Users, 
  CheckSquare,
  MessageSquare,
  Camera,
  Link2,
  Tag,
  Calendar,
  User,
  Plus
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const mockIncidents = [
  {
    id: 'INC-2024-001',
    title: 'Suspected Data Exfiltration',
    status: 'investigating',
    severity: 'high',
    assignee: 'analyst_alice',
    created: '2024-01-21 08:30:00',
    updated: '2024-01-21 10:15:00',
    description: 'Large data transfer detected to external IP address',
    category: 'Data Breach',
    source_alert: 'ALT-2024-045'
  },
  {
    id: 'INC-2024-002',
    title: 'Malware Detection on CEO Laptop',
    status: 'contained',
    severity: 'critical',
    assignee: 'analyst_bob',
    created: '2024-01-21 06:45:00',
    updated: '2024-01-21 09:20:00',
    description: 'Banking trojan detected on executive workstation',
    category: 'Malware',
    source_alert: 'ALT-2024-043'
  },
  {
    id: 'INC-2024-003',
    title: 'Brute Force Attack on SSH Server',
    status: 'resolved',
    severity: 'medium',
    assignee: 'analyst_charlie',
    created: '2024-01-20 14:20:00',
    updated: '2024-01-21 07:45:00',
    description: 'Successful brute force attack blocked by firewall rules',
    category: 'Unauthorized Access',
    source_alert: 'ALT-2024-041'
  }
];

const mockTasks = [
  {
    id: '1',
    incident_id: 'INC-2024-001',
    title: 'Collect network logs from affected systems',
    status: 'in_progress',
    assignee: 'analyst_alice',
    due_date: '2024-01-21 12:00:00',
    priority: 'high'
  },
  {
    id: '2',
    incident_id: 'INC-2024-001',
    title: 'Interview user who initiated transfer',
    status: 'pending',
    assignee: 'analyst_bob',
    due_date: '2024-01-21 14:00:00',
    priority: 'medium'
  },
  {
    id: '3',
    incident_id: 'INC-2024-002',
    title: 'Image affected workstation',
    status: 'completed',
    assignee: 'analyst_bob',
    due_date: '2024-01-21 08:00:00',
    priority: 'high'
  }
];

const mockEvidence = [
  {
    id: '1',
    incident_id: 'INC-2024-001',
    type: 'Network Logs',
    name: 'firewall_20240121.log',
    collected_by: 'analyst_alice',
    collected_at: '2024-01-21 09:30:00',
    hash: 'sha256:a1b2c3d4...',
    size: '2.4 MB'
  },
  {
    id: '2',
    incident_id: 'INC-2024-002',
    type: 'Disk Image',
    name: 'ceo_laptop_image.dd',
    collected_by: 'analyst_bob',
    collected_at: '2024-01-21 07:15:00',
    hash: 'sha256:e5f6g7h8...',
    size: '250 GB'
  },
  {
    id: '3',
    incident_id: 'INC-2024-001',
    type: 'Screenshot',
    name: 'suspicious_transfer.png',
    collected_by: 'analyst_alice',
    collected_at: '2024-01-21 08:45:00',
    hash: 'sha256:i9j0k1l2...',
    size: '1.2 MB'
  }
];

const mockTimeline = [
  {
    id: '1',
    incident_id: 'INC-2024-001',
    timestamp: '2024-01-21 08:30:00',
    event: 'Incident Created',
    description: 'Automated alert triggered incident creation',
    author: 'system'
  },
  {
    id: '2',
    incident_id: 'INC-2024-001',
    timestamp: '2024-01-21 08:35:00',
    event: 'Assigned to Analyst',
    description: 'Incident assigned to analyst_alice for investigation',
    author: 'system'
  },
  {
    id: '3',
    incident_id: 'INC-2024-001',
    timestamp: '2024-01-21 09:15:00',
    event: 'Evidence Collected',
    description: 'Network logs collected from firewall',
    author: 'analyst_alice'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new': return 'status-info';
    case 'investigating': return 'status-medium';
    case 'contained': return 'status-high';
    case 'resolved': return 'status-low';
    case 'closed': return 'bg-muted text-muted-foreground';
    default: return 'status-info';
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'status-critical';
    case 'high': return 'status-high';
    case 'medium': return 'status-medium';
    case 'low': return 'status-low';
    default: return 'status-info';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'status-critical';
    case 'high': return 'status-high';
    case 'medium': return 'status-medium';
    case 'low': return 'status-low';
    default: return 'status-info';
  }
};

const IncidentResponse = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(mockIncidents[0].id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Incident Response</h1>
          <p className="text-muted-foreground mt-1">
            Manage security incidents and coordinate response activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Incident
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Open Incidents</p>
                <p className="text-white text-2xl font-bold">8</p>
              </div>
              <AlertCircle className="h-8 w-8 text-white/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Critical Incidents</p>
                <p className="text-foreground text-2xl font-bold">2</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Avg Response Time</p>
                <p className="text-foreground text-2xl font-bold">23m</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Active Analysts</p>
                <p className="text-foreground text-2xl font-bold">5</p>
              </div>
              <Users className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="incidents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="incidents" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Incidents
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <CheckSquare className="h-4 w-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="evidence" className="gap-2">
            <Camera className="h-4 w-4" />
            Evidence
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <Clock className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="playbooks" className="gap-2">
            <FileText className="h-4 w-4" />
            Playbooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Security Incidents</CardTitle>
                  <CardDescription>
                    Track and manage security incidents from detection to resolution
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="contained">Contained</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockIncidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell>
                        <Button variant="link" className="p-0 font-mono text-sm">
                          {incident.id}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{incident.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {incident.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(incident.status)}>
                          {incident.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(incident.severity)}>
                          {incident.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>{incident.assignee}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{incident.category}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{incident.created}</TableCell>
                      <TableCell className="font-mono text-sm">{incident.updated}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Incident Tasks</CardTitle>
              <CardDescription>
                Track investigation and response tasks for active incidents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Incident</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <Button variant="link" className="p-0 font-mono text-sm">
                          {task.incident_id}
                        </Button>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="font-medium">{task.title}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{task.assignee}</TableCell>
                      <TableCell className="font-mono text-sm">{task.due_date}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            Complete
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

        <TabsContent value="evidence" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Digital Evidence</CardTitle>
              <CardDescription>
                Manage and track digital evidence collected during investigations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Incident</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Hash</TableHead>
                    <TableHead>Collected By</TableHead>
                    <TableHead>Collected At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockEvidence.map((evidence) => (
                    <TableRow key={evidence.id}>
                      <TableCell>
                        <Button variant="link" className="p-0 font-mono text-sm">
                          {evidence.incident_id}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{evidence.type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{evidence.name}</TableCell>
                      <TableCell>{evidence.size}</TableCell>
                      <TableCell className="font-mono text-xs max-w-xs truncate">
                        {evidence.hash}
                      </TableCell>
                      <TableCell>{evidence.collected_by}</TableCell>
                      <TableCell className="font-mono text-sm">{evidence.collected_at}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Incident Timeline</CardTitle>
                  <CardDescription>
                    Chronological view of incident events and activities
                  </CardDescription>
                </div>
                <Select value={selectedIncident} onValueChange={setSelectedIncident}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockIncidents.map((incident) => (
                      <SelectItem key={incident.id} value={incident.id}>
                        {incident.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTimeline.map((event) => (
                  <div key={event.id} className="flex items-start space-x-4 border-l-2 border-primary pl-4 pb-4">
                    <div className="flex-shrink-0 w-3 h-3 bg-primary rounded-full -ml-[7px] mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{event.event}</div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {event.timestamp}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {event.description}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        by {event.author}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="playbooks" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Malware Response</CardTitle>
                <CardDescription>Standard procedure for malware incidents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Steps:</span>
                    <span>12</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Avg Duration:</span>
                    <span>45 minutes</span>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Start Playbook
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Data Breach Response</CardTitle>
                <CardDescription>Comprehensive data breach investigation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Steps:</span>
                    <span>18</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Avg Duration:</span>
                    <span>2 hours</span>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Start Playbook
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Phishing Response</CardTitle>
                <CardDescription>Email-based phishing attack response</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Steps:</span>
                    <span>8</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Avg Duration:</span>
                    <span>30 minutes</span>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Start Playbook
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IncidentResponse;