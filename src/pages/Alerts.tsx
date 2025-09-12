import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle, 
  Search, 
  Eye, 
  CheckCircle,
  XCircle,
  User,
  Clock,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { mockAlerts, getSeverityBadgeClass } from '@/lib/mockData';
import type { Alert } from '@/lib/types';

const Alerts = () => {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [sortBy, setSortBy] = useState('timestamp_last');

  const filteredAlerts = alerts
    .filter(alert => {
      const matchesSearch = !searchFilter || 
        alert.rule_title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        alert.entity_keys.some(key => key.toLowerCase().includes(searchFilter.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
      const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;

      return matchesSearch && matchesStatus && matchesSeverity;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'timestamp_last':
          return new Date(b.timestamp_last).getTime() - new Date(a.timestamp_last).getTime();
        case 'severity':
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1, informational: 0 };
          return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
        case 'count':
          return b.count - a.count;
        default:
          return 0;
      }
    });

  const updateAlertStatus = (alertId: string, status: Alert['status']) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, status } : alert
    ));
  };

  const assignAlert = (alertId: string, assignedTo: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, assigned_to: assignedTo } : alert
    ));
  };

  const addNote = (alertId: string, note: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, notes: note } : alert
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'investigating':
        return <Eye className="h-4 w-4 text-yellow-400" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'false_positive':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'investigating':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'resolved':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'false_positive':
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Alerts</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and respond to security incidents
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="destructive" className="text-sm">
            {alerts.filter(a => a.status === 'open').length} Open
          </Badge>
          <Badge variant="outline" className="text-sm">
            {alerts.length} Total
          </Badge>
        </div>
      </div>

      {!selectedAlert && (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search alerts..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:w-auto">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="false_positive">False Positive</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="timestamp_last">Latest First</SelectItem>
                      <SelectItem value="severity">By Severity</SelectItem>
                      <SelectItem value="count">By Count</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts List */}
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="mt-1">
                        {getStatusIcon(alert.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={`text-xs ${getSeverityBadgeClass(alert.severity)}`}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge className={`text-xs border ${getStatusColor(alert.status)}`}>
                            {alert.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(alert.timestamp_last)}
                          </span>
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-1">{alert.rule_title}</h3>
                        
                        <div className="text-sm text-muted-foreground mb-2">
                          <span className="font-medium">{alert.count}</span> events
                          {alert.timestamp_first.getTime() !== alert.timestamp_last.getTime() && (
                            <span> over {Math.round((alert.timestamp_last.getTime() - alert.timestamp_first.getTime()) / 60000)} minutes</span>
                          )}
                        </div>

                        {/* Entity Keys */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {alert.entity_keys.map((key) => (
                            <Badge key={key} variant="outline" className="text-xs font-mono">
                              {key}
                            </Badge>
                          ))}
                        </div>

                        {/* Assignment */}
                        {alert.assigned_to && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <User className="h-3 w-3 mr-1" />
                            Assigned to {alert.assigned_to}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAlert(alert)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                      
                      <Select
                        value={alert.status}
                        onValueChange={(value: Alert['status']) => updateAlertStatus(alert.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="investigating">Investigating</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="false_positive">False Positive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredAlerts.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No alerts found</p>
                  <p className="text-sm">All clear or adjust your search filters</p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Alert Detail View */}
      {selectedAlert && (
        <AlertDetailView
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onUpdateStatus={(status) => {
            updateAlertStatus(selectedAlert.id, status);
            setSelectedAlert({ ...selectedAlert, status });
          }}
          onAssign={(assignedTo) => {
            assignAlert(selectedAlert.id, assignedTo);
            setSelectedAlert({ ...selectedAlert, assigned_to: assignedTo });
          }}
          onAddNote={(note) => {
            addNote(selectedAlert.id, note);
            setSelectedAlert({ ...selectedAlert, notes: note });
          }}
        />
      )}
    </div>
  );
};

// Alert Detail Component
const AlertDetailView = ({ 
  alert, 
  onClose, 
  onUpdateStatus, 
  onAssign, 
  onAddNote 
}: { 
  alert: Alert;
  onClose: () => void;
  onUpdateStatus: (status: Alert['status']) => void;
  onAssign: (assignedTo: string) => void;
  onAddNote: (note: string) => void;
}) => {
  const [note, setNote] = useState(alert.notes || '');
  const [assignee, setAssignee] = useState(alert.assigned_to || '');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Alert Details</span>
            </CardTitle>
            <Button variant="ghost" onClick={onClose}>✕</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Alert Information */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">{alert.rule_title}</h2>
                <div className="flex items-center space-x-2 mb-4">
                  <Badge className={`${getSeverityBadgeClass(alert.severity)}`}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">
                    Rule ID: {alert.rule_id}
                  </Badge>
                </div>
              </div>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">First Event</p>
                        <p className="text-xs text-muted-foreground">
                          {alert.timestamp_first.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Last Event</p>
                        <p className="text-xs text-muted-foreground">
                          {alert.timestamp_last.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Total Events</p>
                        <p className="text-xs text-muted-foreground">{alert.count} events</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Correlation Explanation */}
              {alert.explain && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Correlation Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Trigger Reason</Label>
                        <p className="text-sm">{alert.explain.trigger_reason}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Correlation Window</Label>
                        <p className="text-sm">{alert.explain.correlation_window}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Entity Summary</Label>
                        <div className="bg-muted/30 rounded p-3 font-mono text-xs">
                          {JSON.stringify(alert.explain.entity_summary, null, 2)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Related Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Related Events ({alert.events.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto siem-scrollbar">
                    {alert.events.map((event) => (
                      <div key={event.id} className="p-3 bg-muted/30 rounded text-sm">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-mono text-xs">{event.timestamp.toLocaleString()}</span>
                          <Badge variant="outline" className="text-xs">{event.event.dataset}</Badge>
                        </div>
                        <p className="font-medium">{event.host.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.source?.ip} → {event.destination?.ip}:{event.destination?.port}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions Panel */}
            <div className="space-y-6">
              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status & Assignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Status</Label>
                    <Select value={alert.status} onValueChange={onUpdateStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="investigating">Investigating</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="false_positive">False Positive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Assign To</Label>
                    <Input
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                      placeholder="analyst username"
                      onBlur={() => assignee && onAssign(assignee)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Investigation Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Investigation Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add investigation notes..."
                    rows={6}
                  />
                  <Button 
                    onClick={() => onAddNote(note)} 
                    className="w-full"
                  >
                    Save Notes
                  </Button>
                </CardContent>
              </Card>

              {/* Entity Keys */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Entity Keys</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {alert.entity_keys.map((key) => (
                      <Badge key={key} variant="outline" className="w-full justify-start font-mono text-xs">
                        {key}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Alerts;