import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Rule } from '@/lib/types';

interface DatabaseRule {
  id: string;
  title: string;
  description?: string;
  type: 'sigma' | 'cel' | 'python';
  enabled: boolean;
  yaml?: string;
  expression?: string;
  python_code?: string;
  timeframe?: number;
  threshold?: number;
  level: 'critical' | 'high' | 'medium' | 'low' | 'informational';
  fields: string[];
  tags: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
  last_triggered?: string;
  trigger_count: number;
}

const mapDatabaseToRule = (dbRule: DatabaseRule): Rule => ({
  ...dbRule,
  created_by: dbRule.created_by || 'unknown',
  created_at: new Date(dbRule.created_at),
  updated_at: new Date(dbRule.updated_at),
  last_triggered: dbRule.last_triggered ? new Date(dbRule.last_triggered) : undefined,
});

const mapRuleToDatabase = (rule: Partial<Rule>): Partial<DatabaseRule> => ({
  ...rule,
  created_at: rule.created_at?.toISOString(),
  updated_at: rule.updated_at?.toISOString(),
  last_triggered: rule.last_triggered?.toISOString(),
});

export const useRules = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedRules = data?.map(mapDatabaseToRule) || [];
      setRules(mappedRules);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createRule = async (ruleData: Omit<Rule, 'id' | 'created_at' | 'updated_at' | 'trigger_count'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const insertData = {
        title: ruleData.title,
        description: ruleData.description,
        type: ruleData.type,
        enabled: ruleData.enabled || false,
        yaml: ruleData.yaml,
        expression: ruleData.expression,
        python_code: ruleData.python_code,
        timeframe: ruleData.timeframe,
        threshold: ruleData.threshold,
        level: ruleData.level,
        fields: ruleData.fields || [],
        tags: ruleData.tags || [],
        created_by: user?.id,
        trigger_count: 0,
      };
      
      const { data, error } = await supabase
        .from('rules')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      const newRule = mapDatabaseToRule(data);
      setRules(prev => [newRule, ...prev]);
      return newRule;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateRule = async (id: string, updates: Partial<Rule>) => {
    try {
      const { data, error } = await supabase
        .from('rules')
        .update(mapRuleToDatabase(updates))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedRule = mapDatabaseToRule(data);
      setRules(prev => prev.map(rule => rule.id === id ? updatedRule : rule));
      return updatedRule;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteRule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRules(prev => prev.filter(rule => rule.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const testRule = async (ruleId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('rule-engine', {
        body: { action: 'test_rule', rule_id: ruleId }
      });

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const toggleRule = async (id: string) => {
    const rule = rules.find(r => r.id === id);
    if (!rule) return;

    return updateRule(id, { enabled: !rule.enabled });
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchRules();

    const channel = supabase
      .channel('rules-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rules' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newRule = mapDatabaseToRule(payload.new as DatabaseRule);
            setRules(prev => [newRule, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedRule = mapDatabaseToRule(payload.new as DatabaseRule);
            setRules(prev => prev.map(rule => 
              rule.id === updatedRule.id ? updatedRule : rule
            ));
          } else if (payload.eventType === 'DELETE') {
            setRules(prev => prev.filter(rule => rule.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    rules,
    loading,
    error,
    createRule,
    updateRule,
    deleteRule,
    testRule,
    toggleRule,
    refetch: fetchRules,
  };
};
