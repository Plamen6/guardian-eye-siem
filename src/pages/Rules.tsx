import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Plus, 
  Search, 
  Edit, 
  Play, 
  Pause,
  Trash2,
  Copy,
  TestTube,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { useRules } from '@/hooks/useRules';
import { getSeverityBadgeClass } from '@/lib/mockData';
import type { Rule } from '@/lib/types';

const Rules = () => {
  const {
    rules,
    loading,
    error,
    createRule,
    updateRule,
    deleteRule,
    testRule,
    toggleRule
  } = useRules();
  
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filteredRules = rules.filter(rule => {
    const matchesSearch = !searchFilter || 
      rule.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      rule.description?.toLowerCase().includes(searchFilter.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'enabled' && rule.enabled) ||
      (statusFilter === 'disabled' && !rule.enabled);

    return matchesSearch && matchesStatus;
  });

  const toggleRuleHandler = async (ruleId: string) => {
    try {
      await toggleRule(ruleId);
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    }
  };

  const duplicateRule = async (rule: Rule) => {
    try {
        await createRule({
          title: `${rule.title} (Copy)`,
          description: rule.description,
          type: rule.type,
          enabled: false,
          yaml: rule.yaml,
          expression: rule.expression,
          python_code: rule.python_code,
          timeframe: rule.timeframe,
          threshold: rule.threshold,
          level: rule.level,
          fields: rule.fields,
          tags: rule.tags,
          created_by: 'system',
        });
    } catch (error) {
      console.error('Failed to duplicate rule:', error);
    }
  };

  const deleteRuleHandler = async (ruleId: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      try {
        await deleteRule(ruleId);
      } catch (error) {
        console.error('Failed to delete rule:', error);
      }
    }
  };

  const testRuleHandler = async (rule: Rule) => {
    try {
      const result = await testRule(rule.id);
      alert(`Rule test completed. ${result.matches ? 'Rule would trigger!' : 'No matches found.'}`);
    } catch (error) {
      console.error('Failed to test rule:', error);
      alert('Rule test failed. Check console for details.');
    }
  };

  const createNewRule = () => {
    setSelectedRule(null);
    setIsCreating(true);
  };

  const saveRule = async (ruleData: Partial<Rule>) => {
    try {
      if (selectedRule) {
        // Update existing rule
        await updateRule(selectedRule.id, ruleData);
      } else {
        // Create new rule
        await createRule({
          title: ruleData.title || 'New Rule',
          description: ruleData.description,
          type: ruleData.type || 'sigma',
          enabled: false,
          yaml: ruleData.yaml,
          expression: ruleData.expression,
          python_code: ruleData.python_code,
          timeframe: ruleData.timeframe,
          threshold: ruleData.threshold,
          level: ruleData.level || 'medium',
          fields: ruleData.fields || [],
          tags: ruleData.tags || [],
          created_by: 'user',
        });
      }
      setSelectedRule(null);
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to save rule:', error);
      alert('Failed to save rule. Check console for details.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Detection Rules</h1>
          <p className="text-muted-foreground mt-1">
            Manage correlation rules and detection logic
          </p>
        </div>
        <Button onClick={createNewRule}>
          <Plus className="w-4 h-4 mr-2" />
          New Rule
        </Button>
      </div>

      {loading && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading rules...
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="py-12 text-center text-destructive">
            Error: {error}
          </CardContent>
        </Card>
      )}

      {!loading && !error && !isCreating && !selectedRule && (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search rules..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Rules</SelectItem>
                      <SelectItem value="enabled">Enabled Only</SelectItem>
                      <SelectItem value="disabled">Disabled Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rules List */}
          <div className="grid gap-4">
            {filteredRules.map((rule) => (
              <Card key={rule.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CardTitle className="text-lg">{rule.title}</CardTitle>
                        <Badge 
                          className={`text-xs ${getSeverityBadgeClass(rule.level)}`}
                        >
                          {rule.level.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {rule.type.toUpperCase()}
                        </Badge>
                        {rule.enabled ? (
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
                      <CardDescription>{rule.description}</CardDescription>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRule(rule)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => testRuleHandler(rule)}
                      >
                        <TestTube className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => duplicateRule(rule)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRuleHandler(rule.id)}
                      >
                        {rule.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRuleHandler(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Triggered</Label>
                      <p className="font-medium">{rule.trigger_count} times</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Last Trigger</Label>
                      <p className="font-medium">
                        {rule.last_triggered 
                          ? rule.last_triggered.toLocaleDateString()
                          : 'Never'
                        }
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Timeframe</Label>
                      <p className="font-medium">{rule.timeframe ? `${rule.timeframe}m` : 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Created By</Label>
                      <p className="font-medium">{rule.created_by}</p>
                    </div>
                  </div>
                  
                  {rule.tags && rule.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {rule.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {filteredRules.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No rules found</p>
                  <p className="text-sm">Create your first detection rule or adjust your search filters</p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Rule Editor */}
      {(isCreating || selectedRule) && (
        <RuleEditor
          rule={selectedRule}
          onSave={saveRule}
          onCancel={() => {
            setIsCreating(false);
            setSelectedRule(null);
          }}
        />
      )}
    </div>
  );
};

// Rule Editor Component
const RuleEditor = ({ 
  rule, 
  onSave, 
  onCancel 
}: { 
  rule: Rule | null;
  onSave: (rule: Partial<Rule>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    title: rule?.title || '',
    description: rule?.description || '',
    type: rule?.type || 'sigma',
    level: rule?.level || 'medium',
    enabled: rule?.enabled || false,
    timeframe: rule?.timeframe || 5,
    threshold: rule?.threshold || 1,
    yaml: rule?.yaml || `title: New Detection Rule
description: Describe what this rule detects
status: experimental
author: SIEM Team
logsource:
  service: 
  product: 
detection:
  selection:
    event.dataset: 'auth'
    event.action: 'login'
  condition: selection
timeframe: 5m
level: medium`,
    expression: rule?.expression || '',
    python_code: rule?.python_code || `# Python correlation logic
def correlate(events):
    # Implement your correlation logic here
    # Return True if correlation matches, False otherwise
    return False`,
    tags: rule?.tags?.join(', ') || '',
    fields: rule?.fields?.join(', ') || ''
  });

  const handleSave = () => {
    onSave({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      fields: formData.fields.split(',').map(f => f.trim()).filter(f => f)
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {rule ? 'Edit Rule' : 'Create New Rule'}
        </CardTitle>
        <CardDescription>
          {rule ? 'Modify the detection rule configuration' : 'Configure a new detection rule'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="detection">Detection Logic</TabsTrigger>
            <TabsTrigger value="correlation">Correlation</TabsTrigger>
            <TabsTrigger value="test">Test & Deploy</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Rule Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter rule title"
                />
              </div>
              <div>
                <Label htmlFor="type">Rule Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sigma">Sigma Rule</SelectItem>
                    <SelectItem value="cel">CEL Expression</SelectItem>
                    <SelectItem value="python">Python Script</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="level">Severity Level</Label>
                <Select value={formData.level} onValueChange={(value: any) => setFormData({...formData, level: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="informational">Informational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={formData.enabled}
                  onCheckedChange={(checked) => setFormData({...formData, enabled: checked})}
                />
                <Label htmlFor="enabled">Enable Rule</Label>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe what this rule detects"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="attack.credential_access, attack.t1110"
                />
              </div>
              <div>
                <Label htmlFor="fields">Key Fields (comma-separated)</Label>
                <Input
                  id="fields"
                  value={formData.fields}
                  onChange={(e) => setFormData({...formData, fields: e.target.value})}
                  placeholder="source.ip, user.name, event.action"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="detection" className="space-y-4">
            {formData.type === 'sigma' && (
              <div>
                <Label htmlFor="yaml">Sigma Rule (YAML)</Label>
                <Textarea
                  id="yaml"
                  value={formData.yaml}
                  onChange={(e) => setFormData({...formData, yaml: e.target.value})}
                  className="font-mono text-sm min-h-[300px]"
                />
              </div>
            )}

            {formData.type === 'cel' && (
              <div>
                <Label htmlFor="expression">CEL Expression</Label>
                <Textarea
                  id="expression"
                  value={formData.expression}
                  onChange={(e) => setFormData({...formData, expression: e.target.value})}
                  placeholder="has(event.action) && event.action == 'login' && event.outcome == 'failure'"
                  className="font-mono text-sm min-h-[200px]"
                />
              </div>
            )}

            {formData.type === 'python' && (
              <div>
                <Label htmlFor="python_code">Python Code</Label>
                <Textarea
                  id="python_code"
                  value={formData.python_code}
                  onChange={(e) => setFormData({...formData, python_code: e.target.value})}
                  className="font-mono text-sm min-h-[300px]"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="correlation" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timeframe">Time Window (minutes)</Label>
                <Input
                  id="timeframe"
                  type="number"
                  value={formData.timeframe}
                  onChange={(e) => setFormData({...formData, timeframe: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="threshold">Threshold Count</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={formData.threshold}
                  onChange={(e) => setFormData({...formData, threshold: parseInt(e.target.value) || 1})}
                />
              </div>
            </div>
            
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-2">Correlation Settings</h4>
              <p className="text-sm text-muted-foreground">
                This rule will trigger when <strong>{formData.threshold}</strong> matching events
                occur within <strong>{formData.timeframe}</strong> minutes.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <div className="space-y-4">
              <Button variant="outline" className="w-full">
                <TestTube className="w-4 h-4 mr-2" />
                Test Against Sample Data
              </Button>
              
              <Button variant="outline" className="w-full">
                <TestTube className="w-4 h-4 mr-2" />
                Backfill Against Historical Data
              </Button>

              <div className="flex space-x-2">
                <Button onClick={handleSave} className="flex-1">
                  {rule ? 'Update Rule' : 'Create Rule'}
                </Button>
                <Button variant="outline" onClick={onCancel} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Rules;