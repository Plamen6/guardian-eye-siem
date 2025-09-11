// Mock Data for SIEM Demo

import type { 
  NormalizedEvent, 
  Alert, 
  Rule, 
  Connector, 
  SystemStats,
  MetricData,
  TimeSeriesData,
  LookupTable 
} from './types';

// Generate realistic mock events
export const generateMockEvent = (overrides: Partial<NormalizedEvent> = {}): NormalizedEvent => {
  const severities = ['critical', 'high', 'medium', 'low', 'informational'] as const;
  const actions = ['login', 'logout', 'access', 'denied', 'created', 'deleted', 'modified', 'executed'];
  const datasets = ['auth', 'web', 'dns', 'firewall', 'endpoint', 'database', 'email'];
  const hostnames = ['srv-web-01', 'srv-db-02', 'workstation-alice', 'fw-edge-01', 'dns-internal-01'];
  const usernames = ['alice.smith', 'bob.jones', 'charlie.brown', 'admin', 'service_account'];
  
  const baseEvent: NormalizedEvent = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date(Date.now() - Math.random() * 86400000), // Last 24h
    event: {
      id: Math.random().toString(36).substr(2, 9),
      dataset: datasets[Math.floor(Math.random() * datasets.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      action: actions[Math.floor(Math.random() * actions.length)],
      outcome: Math.random() > 0.8 ? 'failure' : 'success'
    },
    host: {
      name: hostnames[Math.floor(Math.random() * hostnames.length)],
      ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`
    },
    source: {
      ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      port: Math.floor(Math.random() * 65535)
    },
    destination: {
      ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      port: [80, 443, 22, 3389, 53, 3306][Math.floor(Math.random() * 6)]
    },
    user: {
      name: usernames[Math.floor(Math.random() * usernames.length)],
      id: Math.random().toString(36).substr(2, 6)
    },
    ingest: {
      source: Math.random() > 0.5 ? 'file' : 'syslog',
      connector_id: `conn_${Math.random().toString(36).substr(2, 6)}`
    }
  };

  return { ...baseEvent, ...overrides };
};

export const mockEvents: NormalizedEvent[] = Array.from({ length: 100 }, () => generateMockEvent());

// Live stream events (updated periodically)
export const liveEvents: NormalizedEvent[] = Array.from({ length: 20 }, () => 
  generateMockEvent({ timestamp: new Date() })
);

export const mockAlerts: Alert[] = [
  {
    id: 'alert_001',
    rule_id: 'rule_001',
    rule_title: 'Brute Force SSH Attack Detected',
    severity: 'high',
    status: 'open',
    timestamp_first: new Date(Date.now() - 3600000),
    timestamp_last: new Date(),
    count: 15,
    entity_keys: ['source.ip:45.33.32.156', 'destination.ip:192.168.1.100'],
    events: mockEvents.slice(0, 5),
    explain: {
      matched_events: 15,
      correlation_window: '5 minutes',
      trigger_reason: 'More than 10 failed SSH login attempts from same IP',
      entity_summary: {
        'source.ip': '45.33.32.156',
        'user.name': 'root',
        'destination.port': 22
      }
    }
  },
  {
    id: 'alert_002',
    rule_id: 'rule_002',
    rule_title: 'Suspicious DNS Query Pattern',
    severity: 'medium',
    status: 'investigating',
    timestamp_first: new Date(Date.now() - 1800000),
    timestamp_last: new Date(Date.now() - 300000),
    count: 8,
    entity_keys: ['host.name:workstation-alice', 'dns.question.name:*.malicious.com'],
    events: mockEvents.slice(5, 10),
    explain: {
      matched_events: 8,
      correlation_window: '10 minutes',
      trigger_reason: 'Multiple DNS queries to known malicious domains',
      entity_summary: {
        'host.name': 'workstation-alice',
        'user.name': 'alice.smith'
      }
    },
    assigned_to: 'analyst_bob'
  },
  {
    id: 'alert_003',
    rule_id: 'rule_003',
    rule_title: 'Privilege Escalation Sequence',
    severity: 'critical',
    status: 'resolved',
    timestamp_first: new Date(Date.now() - 7200000),
    timestamp_last: new Date(Date.now() - 5400000),
    count: 3,
    entity_keys: ['user.name:charlie.brown', 'host.name:srv-db-02'],
    events: mockEvents.slice(10, 13),
    explain: {
      matched_events: 3,
      correlation_window: '30 minutes',
      trigger_reason: 'Login followed by privilege change and sensitive file access',
      entity_summary: {
        'user.name': 'charlie.brown',
        'process.name': 'sudo'
      }
    },
    assigned_to: 'analyst_alice',
    resolution: 'Authorized maintenance activity - admin confirmed legitimate use'
  }
];

export const mockRules: Rule[] = [
  {
    id: 'rule_001',
    title: 'Brute Force SSH Attack',
    description: 'Detects multiple failed SSH login attempts from the same source IP',
    type: 'sigma',
    enabled: true,
    yaml: `title: SSH Brute Force Attack
description: Detects potential SSH brute force attacks
status: experimental
author: SIEM Team
logsource:
  service: ssh
  product: linux
detection:
  selection:
    event.dataset: 'auth'
    event.action: 'login'
    event.outcome: 'failure'
    destination.port: 22
  condition: selection | count() by source.ip > 10
timeframe: 5m
level: high`,
    timeframe: 5,
    threshold: 10,
    level: 'high',
    fields: ['source.ip', 'user.name', 'destination.port'],
    tags: ['attack.credential_access', 'attack.t1110'],
    created_by: 'admin',
    created_at: new Date(Date.now() - 86400000),
    updated_at: new Date(Date.now() - 3600000),
    last_triggered: new Date(Date.now() - 1800000),
    trigger_count: 23
  },
  {
    id: 'rule_002',
    title: 'Malicious DNS Queries',
    description: 'Detects DNS queries to known malicious domains',
    type: 'cel',
    enabled: true,
    expression: `has(dns.question.name) && 
                 dns.question.name.endsWith('.malicious.com') ||
                 dns.question.name.endsWith('.evil.net')`,
    level: 'medium',
    fields: ['dns.question.name', 'host.name', 'user.name'],
    tags: ['attack.command_and_control', 'attack.t1071'],
    created_by: 'analyst_alice',
    created_at: new Date(Date.now() - 172800000),
    updated_at: new Date(Date.now() - 7200000),
    last_triggered: new Date(Date.now() - 900000),
    trigger_count: 12
  },
  {
    id: 'rule_003',
    title: 'Privilege Escalation Sequence',
    description: 'Detects login followed by privilege escalation activities',
    type: 'python',
    enabled: true,
    python_code: `# Sequence detection: Login -> Sudo -> File Access
def correlate(events):
    user_events = {}
    for event in events:
        user = event.get('user', {}).get('name')
        if not user:
            continue
            
        if user not in user_events:
            user_events[user] = []
        user_events[user].append(event)
    
    for user, user_evts in user_events.items():
        # Sort by timestamp
        user_evts.sort(key=lambda x: x['timestamp'])
        
        # Look for sequence: login -> sudo -> file access
        has_login = any(e.get('event', {}).get('action') == 'login' for e in user_evts)
        has_sudo = any('sudo' in str(e.get('process', {}).get('name', '')) for e in user_evts)
        has_file_access = any(e.get('event', {}).get('dataset') == 'file' for e in user_evts)
        
        if has_login and has_sudo and has_file_access:
            return True
    return False`,
    timeframe: 30,
    level: 'critical',
    fields: ['user.name', 'process.name', 'event.action'],
    tags: ['attack.privilege_escalation', 'attack.t1548'],
    created_by: 'analyst_bob',
    created_at: new Date(Date.now() - 259200000),
    updated_at: new Date(Date.now() - 86400000),
    last_triggered: new Date(Date.now() - 5400000),
    trigger_count: 3
  }
];

export const mockConnectors: Connector[] = [
  {
    id: 'conn_001',
    name: 'System Logs Monitor',
    type: 'file_tail',
    enabled: true,
    config: {
      path: '/var/log',
      include_patterns: ['*.log', 'auth.log', 'syslog'],
      exclude_patterns: ['*.gz', '*.old'],
      recursive: true,
      follow_symlinks: false,
      parser_hint: 'syslog'
    },
    state: {
      last_offset: 1024768,
      last_file: '/var/log/auth.log',
      bytes_processed: 52348976,
      events_processed: 89234,
      errors: 2,
      last_activity: new Date(Date.now() - 30000)
    },
    created_at: new Date(Date.now() - 86400000 * 7),
    updated_at: new Date(Date.now() - 30000)
  },
  {
    id: 'conn_002',
    name: 'Syslog UDP Receiver',
    type: 'syslog_udp',
    enabled: true,
    config: {
      host: '0.0.0.0',
      port: 514,
      protocol: 'udp',
      format: 'auto'
    },
    state: {
      bytes_processed: 12845632,
      events_processed: 34521,
      errors: 0,
      last_activity: new Date(Date.now() - 5000)
    },
    created_at: new Date(Date.now() - 86400000 * 5),
    updated_at: new Date(Date.now() - 5000)
  }
];

export const mockSystemStats: SystemStats = {
  events_per_second: 127.5,
  total_events: 1234567,
  active_rules: 15,
  open_alerts: 8,
  connectors_healthy: 2,
  connectors_total: 2,
  disk_usage: {
    used: 45.2,
    total: 100,
    percentage: 45.2
  },
  memory_usage: {
    used: 6.8,
    total: 16,
    percentage: 42.5
  }
};

export const mockMetrics: MetricData[] = [
  { label: 'Events/sec', value: 127.5, trend: 'up', change: 12.3, unit: 'eps' },
  { label: 'Open Alerts', value: 8, trend: 'down', change: -2 },
  { label: 'Active Rules', value: 15, trend: 'stable' },
  { label: 'Connectors Up', value: '2/2', trend: 'stable' }
];

export const mockTimeSeriesData: TimeSeriesData[] = Array.from({ length: 24 }, (_, i) => ({
  timestamp: new Date(Date.now() - (23 - i) * 3600000),
  value: Math.floor(Math.random() * 200) + 50,
  label: `${23 - i}:00`
}));

export const mockLookupTables: LookupTable[] = [
  {
    id: 'lookup_001',
    name: 'Malicious IPs',
    description: 'Known malicious IP addresses from threat intelligence',
    type: 'ioc',
    entries: [
      { key: '45.33.32.156', value: { threat_level: 'high', source: 'AlienVault', first_seen: '2024-01-15' } },
      { key: '198.51.100.42', value: { threat_level: 'medium', source: 'Manual', first_seen: '2024-01-20' } }
    ],
    created_at: new Date(Date.now() - 86400000 * 30),
    updated_at: new Date(Date.now() - 86400000)
  },
  {
    id: 'lookup_002',
    name: 'Asset Inventory',
    description: 'Organization asset inventory with criticality',
    type: 'asset',
    entries: [
      { key: 'srv-db-02', value: { criticality: 'high', owner: 'IT', environment: 'production' } },
      { key: 'workstation-alice', value: { criticality: 'medium', owner: 'alice.smith', environment: 'user' } }
    ],
    created_at: new Date(Date.now() - 86400000 * 60),
    updated_at: new Date(Date.now() - 86400000 * 7)
  }
];

// Simulate live data updates
export const generateLiveEvent = (): NormalizedEvent => {
  return generateMockEvent({ 
    timestamp: new Date(),
    event: {
      ...generateMockEvent().event,
      severity: Math.random() > 0.9 ? 'high' : Math.random() > 0.7 ? 'medium' : 'low'
    }
  });
};

// Export utility functions
export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'critical': return 'text-red-400';
    case 'high': return 'text-orange-400';  
    case 'medium': return 'text-yellow-400';
    case 'low': return 'text-green-400';
    case 'informational': return 'text-blue-400';
    default: return 'text-foreground';
  }
};

export const getSeverityBadgeClass = (severity: string): string => {
  switch (severity) {
    case 'critical': return 'status-critical';
    case 'high': return 'status-high';
    case 'medium': return 'status-medium';
    case 'low': return 'status-low';
    case 'informational': return 'status-info';
    default: return 'bg-muted text-muted-foreground';
  }
};