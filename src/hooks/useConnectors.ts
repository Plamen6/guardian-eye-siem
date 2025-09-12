import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Connector } from '@/lib/types';

const mapDatabaseToConnector = (dbConnector: any): Connector => ({
  ...dbConnector,
  created_at: new Date(dbConnector.created_at),
  updated_at: new Date(dbConnector.updated_at),
  state: {
    ...dbConnector.state,
    last_activity: dbConnector.state.last_activity 
      ? new Date(dbConnector.state.last_activity) 
      : undefined
  }
});

export const useConnectors = () => {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnectors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('connectors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedConnectors = data?.map(mapDatabaseToConnector) || [];
      setConnectors(mappedConnectors);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createConnector = async (connectorData: Omit<Connector, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const stateData = connectorData.state || {
        bytes_processed: 0,
        events_processed: 0,
        errors: 0,
        last_activity: null
      };
      
      const insertData: any = {
        name: connectorData.name,
        type: connectorData.type,
        enabled: connectorData.enabled,
        config: connectorData.config,
        state: stateData,
      };
      
      if (user?.id) {
        insertData.created_by = user.id;
      }
      
      const { data, error } = await supabase
        .from('connectors')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      const newConnector = mapDatabaseToConnector(data as any);
      setConnectors(prev => [newConnector, ...prev]);
      return newConnector;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateConnector = async (id: string, updates: Partial<Connector>) => {
    try {
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.type) updateData.type = updates.type;
      if (updates.enabled !== undefined) updateData.enabled = updates.enabled;
      if (updates.config) updateData.config = updates.config;
      if (updates.state) {
        const stateData = { ...updates.state };
        if (stateData.last_activity && stateData.last_activity instanceof Date) {
          (stateData as any).last_activity = stateData.last_activity.toISOString();
        }
        updateData.state = stateData;
      }

      const { data, error } = await supabase
        .from('connectors')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedConnector = mapDatabaseToConnector(data as any);
      setConnectors(prev => prev.map(conn => 
        conn.id === id ? updatedConnector : conn
      ));
      return updatedConnector;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteConnector = async (id: string) => {
    try {
      const { error } = await supabase
        .from('connectors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setConnectors(prev => prev.filter(conn => conn.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const toggleConnector = async (id: string) => {
    const connector = connectors.find(c => c.id === id);
    if (!connector) return;

    return updateConnector(id, { 
      enabled: !connector.enabled,
      state: {
        ...connector.state,
        last_activity: new Date()
      }
    });
  };

  const updateConnectorState = async (id: string, stateUpdate: any) => {
    const connector = connectors.find(c => c.id === id);
    if (!connector) return;

    return updateConnector(id, {
      state: {
        ...connector.state,
        ...stateUpdate,
        last_activity: new Date()
      }
    });
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchConnectors();

    const channel = supabase
      .channel('connectors-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'connectors' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newConnector = mapDatabaseToConnector(payload.new as any);
            setConnectors(prev => [newConnector, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedConnector = mapDatabaseToConnector(payload.new as any);
            setConnectors(prev => prev.map(conn => 
              conn.id === updatedConnector.id ? updatedConnector : conn
            ));
          } else if (payload.eventType === 'DELETE') {
            setConnectors(prev => prev.filter(conn => conn.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    connectors,
    loading,
    error,
    createConnector,
    updateConnector,
    deleteConnector,
    toggleConnector,
    updateConnectorState,
    refetch: fetchConnectors,
  };
};