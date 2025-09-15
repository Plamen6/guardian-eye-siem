import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus, 
  X, 
  Code, 
  Lightbulb, 
  Command,
  Search as SearchIcon 
} from 'lucide-react';

interface QueryChip {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface SearchQueryBuilderProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
}

const fieldSuggestions = [
  'event.dataset', 'event.action', 'event.severity', 'event.outcome',
  'host.name', 'host.ip', 'user.name', 'user.id',
  'source.ip', 'source.port', 'destination.ip', 'destination.port',
  'process.name', 'process.pid', 'process.command_line',
  'http.method', 'http.status_code', 'url.full',
  'dns.question.name', 'rule.name', 'rule.id'
];

const operatorOptions = [
  { value: ':', label: 'equals' },
  { value: '!:', label: 'not equals' },
  { value: ':*', label: 'contains' },
  { value: ':>', label: 'greater than' },
  { value: ':<', label: 'less than' },
  { value: ':>=', label: 'greater or equal' },
  { value: ':<=', label: 'less or equal' }
];

const querySuggestions = [
  'event.dataset:"auth" AND event.outcome:"failure"',
  'source.ip:192.168.* AND event.severity:"high"',
  'user.name:admin AND event.action:"login"',
  'process.name:"cmd.exe" OR process.name:"powershell.exe"',
  'http.status_code:>=400 AND url.full:*/admin/*'
];

export const SearchQueryBuilder = ({ query, onQueryChange, onSearch }: SearchQueryBuilderProps) => {
  const [showBuilder, setShowBuilder] = useState(false);
  const [queryChips, setQueryChips] = useState<QueryChip[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addChip = () => {
    const newChip: QueryChip = {
      id: Date.now().toString(),
      field: 'event.dataset',
      operator: ':',
      value: ''
    };
    setQueryChips([...queryChips, newChip]);
  };

  const updateChip = (id: string, updates: Partial<QueryChip>) => {
    setQueryChips(queryChips.map(chip => 
      chip.id === id ? { ...chip, ...updates } : chip
    ));
  };

  const removeChip = (id: string) => {
    setQueryChips(queryChips.filter(chip => chip.id !== id));
  };

  const buildQuery = () => {
    const query = queryChips
      .filter(chip => chip.field && chip.value)
      .map(chip => `${chip.field}${chip.operator}"${chip.value}"`)
      .join(' AND ');
    onQueryChange(query);
    setShowBuilder(false);
  };

  const useSuggestion = (suggestion: string) => {
    onQueryChange(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-3">
      {/* Main Query Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            placeholder='KQL query: event.dataset:"auth" AND (status:fail OR action:deny)'
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            className="font-mono pr-20"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
            <Popover open={showSuggestions} onOpenChange={setShowSuggestions}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Lightbulb className="w-3 h-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-3" align="end">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Query Examples</h4>
                  <div className="space-y-1">
                    {querySuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => useSuggestion(suggestion)}
                        className="w-full justify-start h-auto p-2 text-xs font-mono text-left"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowBuilder(!showBuilder)}
              className="h-6 w-6 p-0"
            >
              <Code className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <Button onClick={onSearch}>
          <SearchIcon className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Visual Query Builder */}
      {showBuilder && (
        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">Visual Query Builder</h3>
            <Button variant="outline" size="sm" onClick={addChip}>
              <Plus className="w-4 h-4 mr-2" />
              Add Condition
            </Button>
          </div>

          <div className="space-y-2">
            {queryChips.map((chip, index) => (
              <div key={chip.id} className="flex items-center gap-2">
                {index > 0 && (
                  <Badge variant="outline" className="text-xs">AND</Badge>
                )}
                
                <Select 
                  value={chip.field} 
                  onValueChange={(value) => updateChip(chip.id, { field: value })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldSuggestions.map(field => (
                      <SelectItem key={field} value={field}>{field}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={chip.operator} 
                  onValueChange={(value) => updateChip(chip.id, { operator: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {operatorOptions.map(op => (
                      <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Value"
                  value={chip.value}
                  onChange={(e) => updateChip(chip.id, { value: e.target.value })}
                  className="flex-1"
                />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeChip(chip.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {queryChips.length === 0 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Click "Add Condition" to build your query visually
              </div>
            )}
          </div>

          {queryChips.length > 0 && (
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setQueryChips([])}>
                Clear
              </Button>
              <Button onClick={buildQuery}>
                Build Query
              </Button>
            </div>
          )}
        </div>
      )}

      {/* KQL Syntax Help */}
      <div className="text-xs text-muted-foreground">
        <strong>KQL Syntax:</strong> field:"value" | field:value* | field:{'>'}100 | 
        field1:"value1" AND field2:"value2" | (field1:"a" OR field2:"b")
      </div>
    </div>
  );
};