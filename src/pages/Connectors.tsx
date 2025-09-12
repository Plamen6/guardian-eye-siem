import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Database, 
  Plus, 
  Settings, 
  Play, 
  Pause,
  Trash2,
  FileText,
  Network,
  Activity,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { mockConnectors } from '@/lib/mockData';
import type { Connector, FileConnectorConfig, SyslogConnectorConfig } from '@/lib/types';

const Connectors = () => {
  const [connectors, setConnectors] = useState(mockConnectors);
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const toggleConnector = (connectorId: string) => {
    setConnectors(connectors.map(conn => 
      conn.id === connectorId ? { ...conn, enabled: !conn.enabled } : conn
    ));
  };

  const deleteConnector = (connectorId: string) => {
    if (confirm('Are you sure you want to delete this connector?')) {
      setConnectors(connectors.filter(conn => conn.id !== connectorId));
    }
  };

  const createNewConnector = () => {
    setSelectedConnector(null);
    setIsCreating(true);
  };

  const saveConnector = (connectorData: Partial<Connector>) => {
    if (selectedConnector) {
      // Update existing
      setConnectors(connectors.map(conn => 
        conn.id === selectedConnector.id 
          ? { ...conn, ...connectorData, updated_at: new Date() }
          : conn
      ));
    } else {
      // Create new
      const newConnector: Connector = {
        id: `conn_${Math.random().toString(36).substr(2, 9)}`,
        name: connectorData.name || 'New Connector',
        type: connectorData.type || 'file_tail',
        enabled: false,
        config: connectorData.config || ({} as FileConnectorConfig | SyslogConnectorConfig),
        state: {
          bytes_processed: 0,
          events_processed: 0,
          errors: 0,
          last_activity: new Date()
        },
        created_at: new Date(),
        updated_at: new Date(),
        ...connectorData
      };
      setConnectors([...connectors, newConnector]);
    }
    setSelectedConnector(null);
    setIsCreating(false);
  };

  const getConnectorIcon = (type: string) => {
    switch (type) {
      case 'file_tail':
        return <FileText className="h-5 w-5 text-blue-400" />;
      case 'syslog_udp':
      case 'syslog_tcp':
        return <Network className="h-5 w-5 text-green-400" />;
      default:
        return <Database className="h-5 w-5" />;
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getHealthStatus = (connector: Connector) => {
    if (!connector.enabled) return { status: 'disabled', color: 'text-gray-400' };
    
    const lastActivity = connector.state.last_activity;
    if (!lastActivity) return { status: 'unknown', color: 'text-yellow-400' };
    
    const timeDiff = Date.now() - lastActivity.getTime();
    const isHealthy = timeDiff < 300000; // 5 minutes
    
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      color: isHealthy ? 'text-green-400' : 'text-red-400'
    };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Connectors</h1>
          <p className="text-muted-foreground mt-1">
            Manage log ingestion sources and configuration
          </p>
        </div>
        <Button onClick={createNewConnector}>
          <Plus className="w-4 h-4 mr-2" />
          New Connector
        </Button>
      </div>

      {!isCreating && !selectedConnector && (
        <>
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Connectors</span>
                </div>
                <p className="text-2xl font-bold mt-1">{connectors.length}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium">Active</span>
                </div>
                <p className="text-2xl font-bold mt-1 text-green-400">
                  {connectors.filter(c => c.enabled && getHealthStatus(c).status === 'healthy').length}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium">Events Today</span>
                </div>
                <p className="text-2xl font-bold mt-1">
                  {connectors.reduce((sum, c) => sum + c.state.events_processed, 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-sm font-medium">Errors</span>
                </div>
                <p className="text-2xl font-bold mt-1 text-red-400">
                  {connectors.reduce((sum, c) => sum + c.state.errors, 0)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Connectors List */}
          <div className="grid gap-4">
            {connectors.map((connector) => {
              const health = getHealthStatus(connector);
              return (
                <Card key={connector.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getConnectorIcon(connector.type)}
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <span>{connector.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {connector.type.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {connector.type === 'file_tail' && (
                              <>Monitoring: {(connector.config as FileConnectorConfig).path}</>
                            )}
                            {(connector.type === 'syslog_udp' || connector.type === 'syslog_tcp') && (
                              <>
                                Listening: {(connector.config as SyslogConnectorConfig).host}:
                                {(connector.config as SyslogConnectorConfig).port}
                              </>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className={`flex items-center space-x-1 ${health.color}`}>
                          <div className={`w-2 h-2 rounded-full ${health.status === 'healthy' ? 'bg-green-400' : health.status === 'unhealthy' ? 'bg-red-400' : 'bg-gray-400'}`}></div>
                          <span className="text-xs capitalize">{health.status}</span>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedConnector(connector)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleConnector(connector.id)}
                        >
                          {connector.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteConnector(connector.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                        <div className="flex items-center space-x-1 mt-1">
                          {connector.enabled ? (
                            <Badge variant="default" className="text-xs">
                              <Play className="w-3 h-3 mr-1" />
                              ACTIVE
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              <Pause className="w-3 h-3 mr-1" />
                              PAUSED
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Events</Label>
                        <p className="font-medium mt-1">{connector.state.events_processed.toLocaleString()}</p>
                      </div>
                      
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Data Processed</Label>
                        <p className="font-medium mt-1">{formatBytes(connector.state.bytes_processed)}</p>
                      </div>
                      
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Last Activity</Label>
                        <p className="font-medium mt-1">
                          {connector.state.last_activity 
                            ? connector.state.last_activity.toLocaleTimeString()
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>
                    
                    {connector.state.errors > 0 && (
                      <div className="mt-3 p-2 bg-red-400/10 border border-red-400/20 rounded text-sm">
                        <div className="flex items-center space-x-1 text-red-400">
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-medium">{connector.state.errors} errors</span>
                        </div>
                        {connector.state.last_error && (
                          <p className="text-xs mt-1 text-muted-foreground">
                            Last: {connector.state.last_error}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            
            {connectors.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No connectors configured</p>
                  <p className="text-sm">Create your first connector to start ingesting logs</p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Connector Editor */}
      {(isCreating || selectedConnector) && (
        <ConnectorEditor
          connector={selectedConnector}
          onSave={saveConnector}
          onCancel={() => {
            setIsCreating(false);
            setSelectedConnector(null);
          }}
        />
      )}
    </div>
  );
};

// Connector Editor Component
const ConnectorEditor = ({ 
  connector, 
  onSave, 
  onCancel 
}: { 
  connector: Connector | null;
  onSave: (connector: Partial<Connector>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: connector?.name || '',
    type: connector?.type || 'file_tail',
    enabled: connector?.enabled || false,
    // File connector config
    path: (connector?.config as FileConnectorConfig)?.path || '/var/log',
    include_patterns: (connector?.config as FileConnectorConfig)?.include_patterns?.join(', ') || '*.log',
    exclude_patterns: (connector?.config as FileConnectorConfig)?.exclude_patterns?.join(', ') || '*.gz, *.old',
    recursive: (connector?.config as FileConnectorConfig)?.recursive ?? true,
    follow_symlinks: (connector?.config as FileConnectorConfig)?.follow_symlinks ?? false,
    parser_hint: (connector?.config as FileConnectorConfig)?.parser_hint || '',
    // Syslog connector config
    host: (connector?.config as SyslogConnectorConfig)?.host || '0.0.0.0',
    port: (connector?.config as SyslogConnectorConfig)?.port || 514,
    protocol: (connector?.config as SyslogConnectorConfig)?.protocol || 'udp',
    format: (connector?.config as SyslogConnectorConfig)?.format || 'auto'
  });

  const handleSave = () => {
    let config: FileConnectorConfig | SyslogConnectorConfig;
    
    if (formData.type === 'file_tail') {
      config = {
        path: formData.path,
        include_patterns: formData.include_patterns.split(',').map(p => p.trim()),
        exclude_patterns: formData.exclude_patterns ? formData.exclude_patterns.split(',').map(p => p.trim()) : [],
        recursive: formData.recursive,
        follow_symlinks: formData.follow_symlinks,
        parser_hint: formData.parser_hint || undefined
      };
    } else {
      config = {
        host: formData.host,
        port: formData.port,
        protocol: formData.protocol as 'udp' | 'tcp',
        format: formData.format as 'rfc3164' | 'rfc5424' | 'auto'
      };
    }

    onSave({
      name: formData.name,
      type: formData.type as Connector['type'],
      enabled: formData.enabled,
      config
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {connector ? 'Edit Connector' : 'Create New Connector'}
        </CardTitle>
        <CardDescription>
          Configure data ingestion source
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Connector Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter connector name"
              />
            </div>
            
            <div>
              <Label htmlFor="type">Connector Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: any) => setFormData({...formData, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="file_tail">File Tail</SelectItem>
                  <SelectItem value="syslog_udp">Syslog UDP</SelectItem>
                  <SelectItem value="syslog_tcp">Syslog TCP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData({...formData, enabled: checked})}
            />
            <Label htmlFor="enabled">Enable Connector</Label>
          </div>
        </div>

        <Separator />

        {/* Type-specific Configuration */}
        {formData.type === 'file_tail' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">File Monitoring Configuration</h3>
            
            <div>
              <Label htmlFor="path">Directory Path</Label>
              <Input
                id="path"
                value={formData.path}
                onChange={(e) => setFormData({...formData, path: e.target.value})}
                placeholder="/var/log"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="include">Include Patterns (comma-separated)</Label>
                <Input
                  id="include"
                  value={formData.include_patterns}
                  onChange={(e) => setFormData({...formData, include_patterns: e.target.value})}
                  placeholder="*.log, auth.log, syslog"
                />
              </div>
              
              <div>
                <Label htmlFor="exclude">Exclude Patterns (comma-separated)</Label>
                <Input
                  id="exclude"
                  value={formData.exclude_patterns}
                  onChange={(e) => setFormData({...formData, exclude_patterns: e.target.value})}
                  placeholder="*.gz, *.old, *.bak"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="recursive"
                  checked={formData.recursive}
                  onCheckedChange={(checked) => setFormData({...formData, recursive: checked})}
                />
                <Label htmlFor="recursive">Recursive Directory Scan</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="symlinks"
                  checked={formData.follow_symlinks}
                  onCheckedChange={(checked) => setFormData({...formData, follow_symlinks: checked})}
                />
                <Label htmlFor="symlinks">Follow Symbolic Links</Label>
              </div>
            </div>
            
            <div>
              <Label htmlFor="parser_hint">Parser Hint (optional)</Label>
              <Select 
                value={formData.parser_hint} 
                onValueChange={(value) => setFormData({...formData, parser_hint: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Auto-detect format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Auto-detect</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="syslog">Syslog</SelectItem>
                  <SelectItem value="apache">Apache</SelectItem>
                  <SelectItem value="nginx">Nginx</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {(formData.type === 'syslog_udp' || formData.type === 'syslog_tcp') && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Syslog Server Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="host">Listen Address</Label>
                <Input
                  id="host"
                  value={formData.host}
                  onChange={(e) => setFormData({...formData, host: e.target.value})}
                  placeholder="0.0.0.0"
                />
              </div>
              
              <div>
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({...formData, port: parseInt(e.target.value) || 514})}
                  placeholder="514"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="format">Syslog Format</Label>
              <Select 
                value={formData.format} 
                onValueChange={(value: any) => setFormData({...formData, format: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  <SelectItem value="rfc3164">RFC 3164 (Legacy)</SelectItem>
                  <SelectItem value="rfc5424">RFC 5424 (Modern)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2 pt-4">
          <Button onClick={handleSave} className="flex-1">
            {connector ? 'Update Connector' : 'Create Connector'}
          </Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Connectors;