import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  Database, 
  TrendingUp, 
  TrendingDown,
  Shield,
  Clock,
  RefreshCw,
  Brain,
  Network,
  Target,
  Eye,
  Zap,
  Globe,
  Users,
  Cpu,
  HardDrive,
  Wifi,
  Lock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  ComposedChart
} from 'recharts';
import { mockSystemStats, mockMetrics, mockTimeSeriesData, getSeverityColor } from '@/lib/mockData';

const Dashboard = () => {
  const [stats, setStats] = useState(mockSystemStats);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [threatScore, setThreatScore] = useState(76);
  const [aiInsights, setAiInsights] = useState([
    { id: 1, type: 'anomaly', message: 'Unusual login pattern detected from 192.168.1.100', severity: 'high', confidence: 0.89 },
    { id: 2, type: 'correlation', message: 'Potential lateral movement between hosts detected', severity: 'critical', confidence: 0.95 },
    { id: 3, type: 'behavioral', message: 'User admin showing atypical data access patterns', severity: 'medium', confidence: 0.72 }
  ]);

  // Advanced ML-driven metrics
  const [mlMetrics, setMlMetrics] = useState({
    anomaly_score: 0.23,
    behavioral_baseline_deviation: 1.8,
    threat_actors_detected: 3,
    correlation_rules_triggered: 12,
    ml_classifications: { malicious: 15, suspicious: 47, benign: 1023 }
  });

  // Real-time updates with ML processing
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        events_per_second: Math.max(0, prev.events_per_second + (Math.random() - 0.5) * 50),
        total_events: prev.total_events + Math.floor(Math.random() * 200),
        open_alerts: Math.max(0, prev.open_alerts + Math.floor(Math.random() - 0.4))
      }));
      
      setThreatScore(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 5)));
      setMlMetrics(prev => ({
        ...prev,
        anomaly_score: Math.max(0, Math.min(1, prev.anomaly_score + (Math.random() - 0.5) * 0.1)),
        behavioral_baseline_deviation: Math.max(0, prev.behavioral_baseline_deviation + (Math.random() - 0.5) * 0.3)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  // Advanced threat intelligence data
  const threatIntelData = [
    { name: 'APT29', activity: 85, risk: 95, color: '#ef4444' },
    { name: 'Lazarus', activity: 42, risk: 88, color: '#f97316' },
    { name: 'FIN7', activity: 23, risk: 72, color: '#eab308' },
    { name: 'Carbanak', activity: 15, risk: 65, color: '#22c55e' }
  ];

  // Network topology simulation data
  const networkTopology = [
    { id: 'dmz', x: 100, y: 150, risk: 45, connections: 15, type: 'network' },
    { id: 'internal', x: 250, y: 100, risk: 25, connections: 45, type: 'network' },
    { id: 'db-tier', x: 400, y: 180, risk: 85, connections: 8, type: 'database' },
    { id: 'web-tier', x: 150, y: 50, risk: 65, connections: 25, type: 'web' }
  ];

  // Risk score calculation
  const riskScoreData = useMemo(() => [
    { name: 'Network', score: 72, max: 100 },
    { name: 'Identity', score: 45, max: 100 },
    { name: 'Data', score: 89, max: 100 },
    { name: 'Endpoint', score: 56, max: 100 }
  ], []);

  return (
    <div className="p-6 space-y-6 max-w-full overflow-x-hidden">
      {/* Enhanced Header with AI Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI-Powered Security Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Next-generation threat detection and behavioral analytics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">AI Engine Active</span>
          </div>
          <Badge variant="outline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Last updated: {new Date().toLocaleTimeString()}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* AI Insights Alert Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {aiInsights.map((insight) => (
          <Alert key={insight.id} className={`border-l-4 ${
            insight.severity === 'critical' ? 'border-l-red-500' :
            insight.severity === 'high' ? 'border-l-orange-500' :
            'border-l-yellow-500'
          }`}>
            <Brain className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium capitalize">{insight.type} Detection</span>
                <Badge variant="outline" className="text-xs">
                  {Math.round(insight.confidence * 100)}% confidence
                </Badge>
              </div>
              {insight.message}
            </AlertDescription>
          </Alert>
        ))}
      </div>

      {/* Enhanced Key Metrics with ML */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="live-pulse">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events/Sec</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.events_per_second.toFixed(1)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-400" />
              +12.3% from baseline
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Score</CardTitle>
            <Target className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{threatScore.toFixed(0)}/100</div>
            <Progress value={threatScore} className="h-2 mt-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ML Anomalies</CardTitle>
            <Brain className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{(mlMetrics.anomaly_score * 100).toFixed(0)}</div>
            <div className="text-xs text-muted-foreground">
              Anomaly confidence
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">{stats.open_alerts}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-green-400" />
              -2 from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Correlations</CardTitle>
            <Network className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-400">{mlMetrics.correlation_rules_triggered}</div>
            <div className="text-xs text-muted-foreground">
              Rules triggered
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Actors</CardTitle>
            <Eye className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{mlMetrics.threat_actors_detected}</div>
            <div className="text-xs text-muted-foreground">
              Detected today
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Tabs */}
      <Tabs defaultValue="threat-landscape" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="threat-landscape">Threat Landscape</TabsTrigger>
          <TabsTrigger value="behavioral-analytics">Behavioral AI</TabsTrigger>
          <TabsTrigger value="network-topology">Network Topology</TabsTrigger>
          <TabsTrigger value="risk-assessment">Risk Assessment</TabsTrigger>
          <TabsTrigger value="threat-intelligence">Threat Intel</TabsTrigger>
        </TabsList>

        <TabsContent value="threat-landscape" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Threat Detection</CardTitle>
                <CardDescription>AI-powered threat classification over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={mockTimeSeriesData}>
                    <defs>
                      <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="label" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#threatGradient)"
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ML Classification Results</CardTitle>
                <CardDescription>Event classification by AI engine</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <div>
                        <div className="font-medium text-red-400">Malicious</div>
                        <div className="text-xs text-muted-foreground">High confidence threats</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-red-400">
                      {mlMetrics.ml_classifications.malicious}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-orange-400" />
                      <div>
                        <div className="font-medium text-orange-400">Suspicious</div>
                        <div className="text-xs text-muted-foreground">Requires investigation</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-orange-400">
                      {mlMetrics.ml_classifications.suspicious}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      <div>
                        <div className="font-medium text-green-400">Benign</div>
                        <div className="text-xs text-muted-foreground">Normal activity</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-400">
                      {mlMetrics.ml_classifications.benign}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="behavioral-analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Behavioral Baseline Deviation</CardTitle>
              <CardDescription>User and entity behavior analysis over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm font-medium mb-2">Current Deviation</div>
                    <div className="text-3xl font-bold text-orange-400">
                      {mlMetrics.behavioral_baseline_deviation.toFixed(1)}σ
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Standard deviations from baseline
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Login Patterns</span>
                      <Badge variant="outline" className="text-xs text-orange-400">Anomalous</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Data Access</span>
                      <Badge variant="outline" className="text-xs text-green-400">Normal</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Network Activity</span>
                      <Badge variant="outline" className="text-xs text-red-400">Critical</Badge>
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={mockTimeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="label" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network-topology" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Network Risk Map</CardTitle>
              <CardDescription>Real-time network topology with risk scoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-80 bg-muted/20 rounded-lg overflow-hidden">
                <svg width="100%" height="100%" className="absolute inset-0">
                  {/* Network connections */}
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {networkTopology.map((node, i) => 
                    networkTopology.slice(i + 1).map((target, j) => (
                      <line
                        key={`${i}-${j}`}
                        x1={node.x}
                        y1={node.y}
                        x2={target.x}
                        y2={target.y}
                        stroke={node.risk > 70 || target.risk > 70 ? "#ef4444" : "#3b82f6"}
                        strokeWidth="2"
                        opacity="0.6"
                        className="animate-pulse"
                      />
                    ))
                  )}
                  
                  {/* Network nodes */}
                  {networkTopology.map((node, i) => (
                    <g key={i}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={Math.max(15, node.connections / 2)}
                        fill={node.risk > 70 ? "#ef4444" : node.risk > 40 ? "#f97316" : "#22c55e"}
                        opacity="0.8"
                        filter="url(#glow)"
                        className="animate-pulse"
                      />
                      <text
                        x={node.x}
                        y={node.y + 25}
                        textAnchor="middle"
                        className="text-xs fill-foreground font-medium"
                      >
                        {node.id}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
              
              <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
                {networkTopology.map((node) => (
                  <div key={node.id} className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm font-medium">{node.id}</div>
                    <div className="text-xs text-muted-foreground mb-2">{node.connections} connections</div>
                    <Progress value={node.risk} className="h-2" />
                    <div className="text-xs mt-1">Risk: {node.risk}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk-assessment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Dimensional Risk Assessment</CardTitle>
              <CardDescription>Risk scores across security domains</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={riskScoreData}>
                  <RadialBar
                    background
                    dataKey="score"
                    fill="#8b5cf6"
                  />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threat-intelligence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Threat Actor Intelligence</CardTitle>
              <CardDescription>Real-time threat actor activity and attribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threatIntelData.map((actor) => (
                  <div key={actor.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-red-400" />
                        <div>
                          <div className="font-medium">{actor.name}</div>
                          <div className="text-xs text-muted-foreground">Threat Actor Group</div>
                        </div>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        Risk: {actor.risk}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Activity Level</span>
                        <span>{actor.activity}%</span>
                      </div>
                      <Progress value={actor.activity} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;