import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Brain, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Eye,
  Activity,
  Clock,
  MapPin,
  Zap
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

const mockUserProfiles = [
  {
    id: '1',
    username: 'alice.smith',
    risk_score: 85,
    baseline_deviation: 'high',
    last_activity: '2 hours ago',
    anomalies: 12,
    login_pattern: 'unusual_hours',
    data_access: 'elevated'
  },
  {
    id: '2',
    username: 'bob.jones',
    risk_score: 23,
    baseline_deviation: 'low',
    last_activity: '15 minutes ago',
    anomalies: 1,
    login_pattern: 'normal',
    data_access: 'normal'
  },
  {
    id: '3',
    username: 'charlie.brown',
    risk_score: 67,
    baseline_deviation: 'medium',
    last_activity: '1 hour ago',
    anomalies: 5,
    login_pattern: 'new_location',
    data_access: 'normal'
  }
];

const mockAnomalies = [
  {
    id: '1',
    type: 'Login Anomaly',
    user: 'alice.smith',
    description: 'Login from unusual geolocation (Russia)',
    severity: 'high',
    timestamp: '2024-01-21 02:15:00',
    ml_confidence: 94,
    status: 'investigating'
  },
  {
    id: '2',
    type: 'Data Access Pattern',
    user: 'charlie.brown',
    description: 'Unusual file access pattern - accessing 3x more files than baseline',
    severity: 'medium',
    timestamp: '2024-01-21 01:30:00',
    ml_confidence: 78,
    status: 'new'
  },
  {
    id: '3',
    type: 'Process Execution',
    user: 'system_svc',
    description: 'Rare process execution pattern detected',
    severity: 'critical',
    timestamp: '2024-01-21 03:45:00',
    ml_confidence: 96,
    status: 'escalated'
  }
];

const mockEntityAnalytics = [
  {
    entity: 'srv-web-01',
    type: 'Host',
    risk_score: 92,
    anomalies: 'Network traffic spike +500%',
    last_seen: '5 minutes ago'
  },
  {
    entity: '192.168.1.100',
    type: 'IP Address',
    risk_score: 45,
    anomalies: 'Port scan activity detected',
    last_seen: '1 hour ago'
  },
  {
    entity: 'finance_app',
    type: 'Application',
    risk_score: 78,
    anomalies: 'Unusual query patterns',
    last_seen: '30 minutes ago'
  }
];

const getRiskColor = (score: number) => {
  if (score >= 80) return 'status-critical';
  if (score >= 60) return 'status-high';
  if (score >= 40) return 'status-medium';
  return 'status-low';
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

const BehavioralAnalytics = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Behavioral Analytics (UEBA)</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered user and entity behavior analysis for threat detection
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Brain className="h-4 w-4" />
            Retrain Models
          </Button>
          <Button className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Active Models</p>
                <p className="text-white text-2xl font-bold">8</p>
              </div>
              <Brain className="h-8 w-8 text-white/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Anomalies Today</p>
                <p className="text-foreground text-2xl font-bold">23</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">High Risk Users</p>
                <p className="text-foreground text-2xl font-bold">4</p>
              </div>
              <Users className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Model Accuracy</p>
                <p className="text-foreground text-2xl font-bold">94%</p>
              </div>
              <Activity className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            User Profiles
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Anomalies
          </TabsTrigger>
          <TabsTrigger value="entities" className="gap-2">
            <Activity className="h-4 w-4" />
            Entity Analytics
          </TabsTrigger>
          <TabsTrigger value="models" className="gap-2">
            <Brain className="h-4 w-4" />
            ML Models
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Behavioral Profiles</CardTitle>
              <CardDescription>
                AI-learned baselines and risk scoring for user behavior patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Baseline Deviation</TableHead>
                    <TableHead>Anomalies</TableHead>
                    <TableHead>Login Pattern</TableHead>
                    <TableHead>Data Access</TableHead>
                    <TableHead>Last Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUserProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">{profile.username}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={profile.risk_score} className="w-20" />
                          <Badge className={getRiskColor(profile.risk_score)}>
                            {profile.risk_score}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            profile.baseline_deviation === 'high' ? 'status-high' :
                            profile.baseline_deviation === 'medium' ? 'status-medium' : 'status-low'
                          }
                        >
                          {profile.baseline_deviation}
                        </Badge>
                      </TableCell>
                      <TableCell>{profile.anomalies}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={profile.login_pattern === 'normal' ? 'secondary' : 'destructive'}
                        >
                          {profile.login_pattern}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={profile.data_access === 'normal' ? 'secondary' : 'destructive'}
                        >
                          {profile.data_access}
                        </Badge>
                      </TableCell>
                      <TableCell>{profile.last_activity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Behavioral Anomalies</CardTitle>
              <CardDescription>
                ML-detected deviations from normal behavior patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>User/Entity</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>ML Confidence</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAnomalies.map((anomaly) => (
                    <TableRow key={anomaly.id}>
                      <TableCell>
                        <Badge variant="outline">{anomaly.type}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{anomaly.user}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {anomaly.description}
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(anomaly.severity)}>
                          {anomaly.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={anomaly.ml_confidence} className="w-16" />
                          <span className="text-sm">{anomaly.ml_confidence}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {anomaly.timestamp}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            anomaly.status === 'new' ? 'status-info' :
                            anomaly.status === 'investigating' ? 'status-medium' :
                            anomaly.status === 'escalated' ? 'status-high' : 'status-low'
                          }
                        >
                          {anomaly.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Entity Risk Analytics</CardTitle>
              <CardDescription>
                Risk assessment and behavioral analysis for hosts, IPs, and applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Detected Anomalies</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockEntityAnalytics.map((entity, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono">{entity.entity}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{entity.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={entity.risk_score} className="w-20" />
                          <Badge className={getRiskColor(entity.risk_score)}>
                            {entity.risk_score}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{entity.anomalies}</TableCell>
                      <TableCell>{entity.last_seen}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            Investigate
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

        <TabsContent value="models" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active ML Models</CardTitle>
                <CardDescription>Machine learning models for behavior analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">User Login Patterns</div>
                      <div className="text-sm text-muted-foreground">Accuracy: 94%</div>
                    </div>
                    <Badge className="status-low">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Data Access Anomalies</div>
                      <div className="text-sm text-muted-foreground">Accuracy: 89%</div>
                    </div>
                    <Badge className="status-low">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Network Behavior</div>
                      <div className="text-sm text-muted-foreground">Accuracy: 91%</div>
                    </div>
                    <Badge className="status-medium">Training</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
                <CardDescription>Performance metrics and training status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Model performance charts coming soon...
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BehavioralAnalytics;