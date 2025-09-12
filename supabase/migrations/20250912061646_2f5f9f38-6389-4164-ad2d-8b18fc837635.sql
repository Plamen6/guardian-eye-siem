-- Create comprehensive SIEM database schema for enterprise use

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types for better data integrity
CREATE TYPE rule_type AS ENUM ('sigma', 'cel', 'python');
CREATE TYPE severity_level AS ENUM ('critical', 'high', 'medium', 'low', 'informational');
CREATE TYPE alert_status AS ENUM ('open', 'investigating', 'resolved', 'false_positive');
CREATE TYPE connector_type AS ENUM ('file_tail', 'syslog_udp', 'syslog_tcp', 'api', 'database');
CREATE TYPE event_outcome AS ENUM ('success', 'failure', 'unknown');

-- Detection Rules Table
CREATE TABLE public.rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    type rule_type NOT NULL DEFAULT 'sigma',
    enabled BOOLEAN NOT NULL DEFAULT false,
    yaml TEXT,
    expression TEXT,
    python_code TEXT,
    timeframe INTEGER, -- in minutes
    threshold INTEGER DEFAULT 1,
    level severity_level NOT NULL DEFAULT 'medium',
    fields TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_triggered TIMESTAMPTZ,
    trigger_count INTEGER NOT NULL DEFAULT 0
);

-- Data Connectors Table
CREATE TABLE public.connectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type connector_type NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT false,
    config JSONB NOT NULL DEFAULT '{}',
    state JSONB NOT NULL DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Normalized Events Table (for correlation and storage)
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    raw_log TEXT,
    event_id TEXT,
    event_dataset TEXT,
    event_severity severity_level,
    event_action TEXT,
    event_outcome event_outcome,
    host_name TEXT,
    host_ip INET,
    source_ip INET,
    source_port INTEGER,
    destination_ip INET,
    destination_port INTEGER,
    user_name TEXT,
    user_id TEXT,
    process_name TEXT,
    file_name TEXT,
    dns_question_name TEXT,
    http_request_method TEXT,
    http_request_url TEXT,
    ingest_source TEXT,
    ingest_connector_id UUID REFERENCES public.connectors(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Alerts Table
CREATE TABLE public.alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID REFERENCES public.rules(id) ON DELETE CASCADE,
    rule_title TEXT NOT NULL,
    severity severity_level NOT NULL,
    status alert_status NOT NULL DEFAULT 'open',
    timestamp_first TIMESTAMPTZ NOT NULL,
    timestamp_last TIMESTAMPTZ NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    entity_keys TEXT[] DEFAULT '{}',
    correlation_data JSONB DEFAULT '{}',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    resolution TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Alert Events (many-to-many relationship)
CREATE TABLE public.alert_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID REFERENCES public.alerts(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lookup Tables for Threat Intelligence
CREATE TABLE public.lookup_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'general',
    entries JSONB NOT NULL DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System Configuration Table
CREATE TABLE public.system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Profiles for additional user information
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT DEFAULT 'analyst',
    department TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_events_timestamp ON public.events(timestamp DESC);
CREATE INDEX idx_events_source_ip ON public.events(source_ip);
CREATE INDEX idx_events_destination_ip ON public.events(destination_ip);
CREATE INDEX idx_events_user_name ON public.events(user_name);
CREATE INDEX idx_events_host_name ON public.events(host_name);
CREATE INDEX idx_events_connector_id ON public.events(ingest_connector_id);
CREATE INDEX idx_events_dataset_action ON public.events(event_dataset, event_action);

CREATE INDEX idx_alerts_rule_id ON public.alerts(rule_id);
CREATE INDEX idx_alerts_status ON public.alerts(status);
CREATE INDEX idx_alerts_severity ON public.alerts(severity);
CREATE INDEX idx_alerts_timestamp ON public.alerts(timestamp_last DESC);
CREATE INDEX idx_alerts_assigned_to ON public.alerts(assigned_to);

CREATE INDEX idx_rules_enabled ON public.rules(enabled);
CREATE INDEX idx_rules_type ON public.rules(type);
CREATE INDEX idx_rules_level ON public.rules(level);

-- Enable Row Level Security
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow authenticated users to read/write their organization's data
-- For demo purposes, we'll allow all authenticated users access
-- In production, you'd implement organization/tenant-based policies

CREATE POLICY "Allow full access to authenticated users" ON public.rules
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow full access to authenticated users" ON public.connectors
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow full access to authenticated users" ON public.events
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow full access to authenticated users" ON public.alerts
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow full access to authenticated users" ON public.alert_events
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow full access to authenticated users" ON public.lookup_tables
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow full access to authenticated users" ON public.system_config
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Profile policies
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rules_updated_at
    BEFORE UPDATE ON public.rules
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_connectors_updated_at
    BEFORE UPDATE ON public.connectors
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at
    BEFORE UPDATE ON public.alerts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lookup_tables_updated_at
    BEFORE UPDATE ON public.lookup_tables
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
        'analyst'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rules;
ALTER PUBLICATION supabase_realtime ADD TABLE public.connectors;