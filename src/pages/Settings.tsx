import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings as SettingsIcon, 
  Database, 
  Clock, 
  Shield, 
  HardDrive,
  Network,
  Bell,
  Upload,
  Download,
  Save,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const [settings, setSettings] = useState({
    // Database Settings
    database: {
      type: 'clickhouse',
      host: 'localhost',
      port: 9000,
      database: 'siem',
      username: 'default',
      password: ''
    },
    // Ingestion Settings
    ingestion: {
      max_events_per_second: 1000,
      batch_size: 1000,
      buffer_timeout: 30,
      enable_backpressure: true
    },
    // Retention Settings
    retention: {
      raw_events_days: 90,
      normalized_events_days: 365,
      alerts_days: 1095, // 3 years
      auto_cleanup: true
    },
    // Correlation Settings
    correlation: {
      max_rules: 100,
      max_correlation_window: 1440, // 24 hours in minutes
      enable_backfill: true,
      parallel_workers: 4
    },
    // UI Settings
    ui: {
      default_time_range: 'last-24h',
      max_search_results: 10000,
      auto_refresh_interval: 30,
      theme: 'dark'
    },
    // Security Settings
    security: {
      session_timeout: 480, // 8 hours in minutes
      password_policy: 'medium',
      audit_logging: true,
      api_rate_limiting: true
    },
    // Notification Settings
    notifications: {
      email_enabled: false,
      webhook_enabled: false,
      smtp_server: '',
      smtp_port: 587,
      smtp_username: '',
      smtp_password: '',
      webhook_url: ''
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Settings saved",
      description: "Configuration has been updated successfully.",
    });
    
    setIsSaving(false);
  };

  const handleTestConnection = async () => {
    toast({
      title: "Testing connection",
      description: "Database connection test initiated...",
    });
    
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Connection successful",
      description: "Database connection is working properly.",
    });
  };

  const handleExportConfig = () => {
    const configStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(configStr);
    const exportFileDefaultName = `siem_config_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Configuration exported",
      description: "Settings have been exported to file.",
    });
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setSettings(importedSettings);
        toast({
          title: "Configuration imported",
          description: "Settings have been imported successfully.",
        });
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Invalid configuration file format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure SIEM system parameters and preferences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportConfig}>
            <Download className="w-4 h-4 mr-2" />
            Export Config
          </Button>
          <Button
            variant="outline"
            onClick={() => document.getElementById('import-file')?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Config
          </Button>
          <input
            id="import-file"
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportConfig}
          />
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="database" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="ingestion">Ingestion</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="correlation">Correlation</TabsTrigger>
          <TabsTrigger value="ui">Interface</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Database Configuration</span>
              </CardTitle>
              <CardDescription>
                Configure the backend database for event storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="db-type">Database Type</Label>
                <Select 
                  value={settings.database.type} 
                  onValueChange={(value) => setSettings({
                    ...settings,
                    database: { ...settings.database, type: value as any }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clickhouse">ClickHouse</SelectItem>
                    <SelectItem value="opensearch">OpenSearch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="db-host">Host</Label>
                  <Input
                    id="db-host"
                    value={settings.database.host}
                    onChange={(e) => setSettings({
                      ...settings,
                      database: { ...settings.database, host: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="db-port">Port</Label>
                  <Input
                    id="db-port"
                    type="number"
                    value={settings.database.port}
                    onChange={(e) => setSettings({
                      ...settings,
                      database: { ...settings.database, port: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="db-name">Database Name</Label>
                  <Input
                    id="db-name"
                    value={settings.database.database}
                    onChange={(e) => setSettings({
                      ...settings,
                      database: { ...settings.database, database: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="db-username">Username</Label>
                  <Input
                    id="db-username"
                    value={settings.database.username}
                    onChange={(e) => setSettings({
                      ...settings,
                      database: { ...settings.database, username: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="db-password">Password</Label>
                <Input
                  id="db-password"
                  type="password"
                  value={settings.database.password}
                  onChange={(e) => setSettings({
                    ...settings,
                    database: { ...settings.database, password: e.target.value }
                  })}
                />
              </div>

              <Button onClick={handleTestConnection} variant="outline">
                <CheckCircle className="w-4 h-4 mr-2" />
                Test Connection
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ingestion">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Network className="h-5 w-5" />
                <span>Data Ingestion Settings</span>
              </CardTitle>
              <CardDescription>
                Configure event processing and ingestion limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max-eps">Max Events Per Second</Label>
                  <Input
                    id="max-eps"
                    type="number"
                    value={settings.ingestion.max_events_per_second}
                    onChange={(e) => setSettings({
                      ...settings,
                      ingestion: { ...settings.ingestion, max_events_per_second: parseInt(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="batch-size">Batch Size</Label>
                  <Input
                    id="batch-size"
                    type="number"
                    value={settings.ingestion.batch_size}
                    onChange={(e) => setSettings({
                      ...settings,
                      ingestion: { ...settings.ingestion, batch_size: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="buffer-timeout">Buffer Timeout (seconds)</Label>
                <Input
                  id="buffer-timeout"
                  type="number"
                  value={settings.ingestion.buffer_timeout}
                  onChange={(e) => setSettings({
                    ...settings,
                    ingestion: { ...settings.ingestion, buffer_timeout: parseInt(e.target.value) }
                  })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="backpressure"
                  checked={settings.ingestion.enable_backpressure}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    ingestion: { ...settings.ingestion, enable_backpressure: checked }
                  })}
                />
                <Label htmlFor="backpressure">Enable Backpressure Control</Label>
              </div>

              <Alert>
                <AlertDescription>
                  Backpressure will slow down ingestion when the system is overwhelmed,
                  preventing data loss but may cause delays.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HardDrive className="h-5 w-5" />
                <span>Data Retention Policy</span>
              </CardTitle>
              <CardDescription>
                Configure how long different types of data are stored
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="raw-retention">Raw Events (days)</Label>
                  <Input
                    id="raw-retention"
                    type="number"
                    value={settings.retention.raw_events_days}
                    onChange={(e) => setSettings({
                      ...settings,
                      retention: { ...settings.retention, raw_events_days: parseInt(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="normalized-retention">Normalized Events (days)</Label>
                  <Input
                    id="normalized-retention"
                    type="number"
                    value={settings.retention.normalized_events_days}
                    onChange={(e) => setSettings({
                      ...settings,
                      retention: { ...settings.retention, normalized_events_days: parseInt(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="alerts-retention">Alerts (days)</Label>
                  <Input
                    id="alerts-retention"
                    type="number"
                    value={settings.retention.alerts_days}
                    onChange={(e) => setSettings({
                      ...settings,
                      retention: { ...settings.retention, alerts_days: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-cleanup"
                  checked={settings.retention.auto_cleanup}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    retention: { ...settings.retention, auto_cleanup: checked }
                  })}
                />
                <Label htmlFor="auto-cleanup">Enable Automatic Cleanup</Label>
              </div>

              <Alert>
                <AlertDescription>
                  Data older than the retention period will be automatically deleted.
                  This action cannot be undone.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Correlation Engine</span>
              </CardTitle>
              <CardDescription>
                Configure rule processing and correlation parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max-rules">Maximum Active Rules</Label>
                  <Input
                    id="max-rules"
                    type="number"
                    value={settings.correlation.max_rules}
                    onChange={(e) => setSettings({
                      ...settings,
                      correlation: { ...settings.correlation, max_rules: parseInt(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="max-window">Max Correlation Window (minutes)</Label>
                  <Input
                    id="max-window"
                    type="number"
                    value={settings.correlation.max_correlation_window}
                    onChange={(e) => setSettings({
                      ...settings,
                      correlation: { ...settings.correlation, max_correlation_window: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="workers">Parallel Workers</Label>
                <Input
                  id="workers"
                  type="number"
                  value={settings.correlation.parallel_workers}
                  onChange={(e) => setSettings({
                    ...settings,
                    correlation: { ...settings.correlation, parallel_workers: parseInt(e.target.value) }
                  })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-backfill"
                  checked={settings.correlation.enable_backfill}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    correlation: { ...settings.correlation, enable_backfill: checked }
                  })}
                />
                <Label htmlFor="enable-backfill">Enable Historical Backfill</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ui">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SettingsIcon className="h-5 w-5" />
                <span>User Interface</span>
              </CardTitle>
              <CardDescription>
                Customize the user interface behavior and defaults
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="time-range">Default Time Range</Label>
                  <Select 
                    value={settings.ui.default_time_range} 
                    onValueChange={(value) => setSettings({
                      ...settings,
                      ui: { ...settings.ui, default_time_range: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last-15m">Last 15 minutes</SelectItem>
                      <SelectItem value="last-1h">Last hour</SelectItem>
                      <SelectItem value="last-24h">Last 24 hours</SelectItem>
                      <SelectItem value="last-7d">Last 7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select 
                    value={settings.ui.theme} 
                    onValueChange={(value) => setSettings({
                      ...settings,
                      ui: { ...settings.ui, theme: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max-results">Max Search Results</Label>
                  <Input
                    id="max-results"
                    type="number"
                    value={settings.ui.max_search_results}
                    onChange={(e) => setSettings({
                      ...settings,
                      ui: { ...settings.ui, max_search_results: parseInt(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="refresh-interval">Auto Refresh Interval (seconds)</Label>
                  <Input
                    id="refresh-interval"
                    type="number"
                    value={settings.ui.auto_refresh_interval}
                    onChange={(e) => setSettings({
                      ...settings,
                      ui: { ...settings.ui, auto_refresh_interval: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
              <CardDescription>
                Configure authentication and security policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={settings.security.session_timeout}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, session_timeout: parseInt(e.target.value) }
                  })}
                />
              </div>

              <div>
                <Label htmlFor="password-policy">Password Policy</Label>
                <Select 
                  value={settings.security.password_policy} 
                  onValueChange={(value) => setSettings({
                    ...settings,
                    security: { ...settings.security, password_policy: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weak">Weak (6+ characters)</SelectItem>
                    <SelectItem value="medium">Medium (8+ chars, mixed case)</SelectItem>
                    <SelectItem value="strong">Strong (12+ chars, symbols)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="audit-logging"
                    checked={settings.security.audit_logging}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      security: { ...settings.security, audit_logging: checked }
                    })}
                  />
                  <Label htmlFor="audit-logging">Enable Audit Logging</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="rate-limiting"
                    checked={settings.security.api_rate_limiting}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      security: { ...settings.security, api_rate_limiting: checked }
                    })}
                  />
                  <Label htmlFor="rate-limiting">Enable API Rate Limiting</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Settings</span>
              </CardTitle>
              <CardDescription>
                Configure alert notifications and integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="email-enabled"
                    checked={settings.notifications.email_enabled}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, email_enabled: checked }
                    })}
                  />
                  <Label htmlFor="email-enabled">Enable Email Notifications</Label>
                </div>

                {settings.notifications.email_enabled && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="smtp-server">SMTP Server</Label>
                        <Input
                          id="smtp-server"
                          value={settings.notifications.smtp_server}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, smtp_server: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtp-port">SMTP Port</Label>
                        <Input
                          id="smtp-port"
                          type="number"
                          value={settings.notifications.smtp_port}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, smtp_port: parseInt(e.target.value) }
                          })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="smtp-username">SMTP Username</Label>
                        <Input
                          id="smtp-username"
                          value={settings.notifications.smtp_username}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, smtp_username: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtp-password">SMTP Password</Label>
                        <Input
                          id="smtp-password"
                          type="password"
                          value={settings.notifications.smtp_password}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, smtp_password: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Separator />

              {/* Webhook Notifications */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="webhook-enabled"
                    checked={settings.notifications.webhook_enabled}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, webhook_enabled: checked }
                    })}
                  />
                  <Label htmlFor="webhook-enabled">Enable Webhook Notifications</Label>
                </div>

                {settings.notifications.webhook_enabled && (
                  <div>
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input
                      id="webhook-url"
                      value={settings.notifications.webhook_url}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, webhook_url: e.target.value }
                      })}
                      placeholder="https://your-webhook-endpoint.com/alerts"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;