import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Alert } from '@/lib/types';

interface DatabaseAlert {
  id: string;
  rule_id?: string;
  rule_title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'informational';
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  timestamp_first: string;
  timestamp_last: string;
  count: number;
  entity_keys: string[];
  correlation_data?: any;
  assigned_to?: string;
  notes?: string;
  resolution?: string;
  created_at: string;
  updated_at: string;
}

const mapDatabaseToAlert = (dbAlert: DatabaseAlert): Alert => ({
  ...dbAlert,
  rule_id: dbAlert.rule_id || '',
  timestamp_first: new Date(dbAlert.timestamp_first),
  timestamp_last: new Date(dbAlert.timestamp_last),
  events: [], // Events are loaded separately
  explain: dbAlert.correlation_data ? {
    matched_events: dbAlert.count,
    correlation_window: dbAlert.correlation_data.timeframe || '5 minutes',
    trigger_reason: dbAlert.correlation_data.trigger_reason || 'Correlation threshold exceeded',
    entity_summary: dbAlert.correlation_data.entity_summary || {}
  } : undefined,
});

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('timestamp_last', { ascending: false });

      if (error) throw error;

      const mappedAlerts = data?.map(mapDatabaseToAlert) || [];
      setAlerts(mappedAlerts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateAlertStatus = async (alertId: string, status: Alert['status']) => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .update({ status })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;

      const updatedAlert = mapDatabaseToAlert(data);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? updatedAlert : alert
      ));
      return updatedAlert;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const assignAlert = async (alertId: string, assignedTo: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const assignToId = assignedTo === 'me' ? user?.id : assignedTo;

      const { data, error } = await supabase
        .from('alerts')
        .update({ assigned_to: assignToId })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;

      const updatedAlert = mapDatabaseToAlert(data);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? updatedAlert : alert
      ));
      return updatedAlert;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const addNote = async (alertId: string, note: string) => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .update({ notes: note })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;

      const updatedAlert = mapDatabaseToAlert(data);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? updatedAlert : alert
      ));
      return updatedAlert;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const resolveAlert = async (alertId: string, resolution: string) => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .update({ 
          status: 'resolved' as const,
          resolution 
        })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;

      const updatedAlert = mapDatabaseToAlert(data);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? updatedAlert : alert
      ));
      return updatedAlert;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const fetchAlertEvents = async (alertId: string) => {
    try {
      const { data, error } = await supabase
        .from('alert_events')
        .select(`
          events (
            id,
            timestamp,
            event_dataset,
            event_action,
            event_outcome,
            source_ip,
            destination_ip,
            user_name,
            host_name,
            metadata
          )
        `)
        .eq('alert_id', alertId);

      if (error) throw error;

      return data?.map(item => ({
        id: item.events.id,
        timestamp: new Date(item.events.timestamp),
        event: {
          id: item.events.id,
          dataset: item.events.event_dataset,
          action: item.events.event_action,
          outcome: item.events.event_outcome
        },
        source: {
          ip: item.events.source_ip
        },
        destination: {
          ip: item.events.destination_ip
        },
        user: {
          name: item.events.user_name
        },
        host: {
          name: item.events.host_name
        },
        metadata: item.events.metadata
      })) || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alerts' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newAlert = mapDatabaseToAlert(payload.new as DatabaseAlert);
            setAlerts(prev => [newAlert, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedAlert = mapDatabaseToAlert(payload.new as DatabaseAlert);
            setAlerts(prev => prev.map(alert => 
              alert.id === updatedAlert.id ? updatedAlert : alert
            ));
          } else if (payload.eventType === 'DELETE') {
            setAlerts(prev => prev.filter(alert => alert.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    alerts,
    loading,
    error,
    updateAlertStatus,
    assignAlert,
    addNote,
    resolveAlert,
    fetchAlertEvents,
    refetch: fetchAlerts,
  };
};
