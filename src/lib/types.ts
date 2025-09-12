// SIEM Type Definitions

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'analyst' | 'viewer';
  email?: string;
  lastLogin?: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token?: string;
}

// Event & Log Types
export interface RawEvent {
  id: string;
  timestamp: Date;
  source: string;
  connector_id: string;
  raw: string;
  file_path?: string;
  host: string;
}

export interface NormalizedEvent {
  id: string;
  timestamp: Date;
  event: {
    id: string;
    dataset: string;
    severity?: EventSeverity;
    action?: string;
    outcome?: 'success' | 'failure' | 'unknown';
  };
  host: {
    name: string;
    ip?: string;
  };
  source: {
    ip?: string;
    port?: number;
    geo?: GeoLocation;
  };
  destination: {
    ip?: string;
    port?: number;
    geo?: GeoLocation;
  };
  user?: {
    name?: string;
    id?: string;
    domain?: string;
  };
  process?: {
    name?: string;
    pid?: number;
    command_line?: string;
  };
  http?: {
    request?: {
      method?: string;
      body?: string;
    };
    response?: {
      status_code?: number;
      body?: string;
    };
  };
  dns?: {
    question?: {
      name?: string;
      type?: string;
    };
    answers?: Array<{
      name?: string;
      type?: string;
      data?: string;
    }>;
  };
  log?: {
    file?: {
      path?: string;
    };
  };
  ingest?: {
    source: 'file' | 'syslog';
    connector_id: string;
    offset?: number;
  };
  json_doc?: Record<string, any>;
}

export interface GeoLocation {
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export type EventSeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational';

// Rule & Correlation Types
export interface Rule {
  id: string;
  title: string;
  description?: string;
  type: 'sigma' | 'cel' | 'python';
  enabled: boolean;
  yaml?: string;
  expression?: string;
  python_code?: string;
  timeframe?: number; // minutes
  threshold?: number;
  level: EventSeverity;
  fields?: string[];
  tags?: string[];
  logsource?: {
    product?: string;
    service?: string;
    category?: string;
  };
  detection?: {
    selection?: Record<string, any>;
    condition?: string;
  };
  created_by: string;
  created_at: Date;
  updated_at: Date;
  last_triggered?: Date;
  trigger_count: number;
}

export interface Alert {
  id: string;
  rule_id: string;
  rule_title: string;
  severity: EventSeverity;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  timestamp_first: Date;
  timestamp_last: Date;
  count: number;
  entity_keys: string[];
  events: NormalizedEvent[];
  explain?: {
    matched_events: number;
    correlation_window: string;
    trigger_reason: string;
    entity_summary: Record<string, any>;
  };
  assigned_to?: string;
  notes?: string;
  resolution?: string;
}

// Connector Types
export interface Connector {
  id: string;
  name: string;
  type: 'file_tail' | 'syslog_udp' | 'syslog_tcp';
  enabled: boolean;
  config: FileConnectorConfig | SyslogConnectorConfig;
  state: {
    last_offset?: number;
    last_file?: string;
    bytes_processed: number;
    events_processed: number;
    errors: number;
    last_error?: string;
    last_activity?: Date;
  };
  created_at: Date;
  updated_at: Date;
}

export interface FileConnectorConfig {
  path: string;
  include_patterns: string[];
  exclude_patterns?: string[];
  recursive: boolean;
  follow_symlinks: boolean;
  parser_hint?: string;
}

export interface SyslogConnectorConfig {
  host: string;
  port: number;
  protocol: 'udp' | 'tcp';
  format: 'rfc3164' | 'rfc5424' | 'auto';
}

// Dashboard & Analytics Types
export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'alert_summary';
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, any>;
}

export interface MetricData {
  label: string;
  value: number | string;
  trend?: 'up' | 'down' | 'stable';
  change?: number;
  unit?: string;
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  label?: string;
}

// Search & Query Types
export interface SearchQuery {
  query_string?: string;
  time_range: {
    from: Date;
    to: Date;
  };
  filters?: SearchFilter[];
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  limit?: number;
  offset?: number;
}

export interface SearchFilter {
  field: string;
  operator: 'eq' | 'ne' | 'contains' | 'not_contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in';
  value: any;
}

export interface SearchResult {
  total: number;
  events: NormalizedEvent[];
  took: number; // ms
  aggregations?: Record<string, any>;
}

// System Configuration Types
export interface SystemConfig {
  database: {
    type: 'clickhouse' | 'opensearch';
    host: string;
    port: number;
    database: string;
    username?: string;
  };
  ingestion: {
    max_events_per_second: number;
    batch_size: number;
    buffer_timeout: number;
  };
  retention: {
    raw_events_days: number;
    normalized_events_days: number;
    alerts_days: number;
  };
  correlation: {
    max_rules: number;
    max_correlation_window: number;
    enable_backfill: boolean;
  };
  ui: {
    default_time_range: string;
    max_search_results: number;
    auto_refresh_interval: number;
  };
}

// Lookup Tables
export interface LookupTable {
  id: string;
  name: string;
  description?: string;
  type: 'ioc' | 'whitelist' | 'geoip' | 'asset' | 'custom';
  entries: LookupEntry[];
  created_at: Date;
  updated_at: Date;
}

export interface LookupEntry {
  key: string;
  value: any;
  metadata?: Record<string, any>;
}

// Stats & Metrics
export interface SystemStats {
  events_per_second: number;
  total_events: number;
  active_rules: number;
  open_alerts: number;
  connectors_healthy: number;
  connectors_total: number;
  disk_usage: {
    used: number;
    total: number;
    percentage: number;
  };
  memory_usage: {
    used: number;
    total: number;
    percentage: number;
  };
}
