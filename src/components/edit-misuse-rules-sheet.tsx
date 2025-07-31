
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash, Plus } from 'lucide-react';

export type MisuseRule = {
    id: string;
    field: 'payer_mismatch' | 'transaction_amount' | 'transaction_count' | 'stores_distance';
    operator: '<' | '<=' | '>' | '>=' | '=';
    value: string;
};

const defaultRules: MisuseRule[] = [
    { id: '1', field: 'payer_mismatch', operator: '>', value: '50' }, // Represents >50%
    { id: '2', field: 'transaction_count', operator: '>', value: '3' }, // Represents >3 transactions in 24 hours
    { id: '3', field: 'stores_distance', operator: '>', value: '100' }, // Represents impossible travel distance
];


type EditMisuseRulesSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rules: MisuseRule[];
  onSave: (rules: MisuseRule[]) => void;
};

const fieldOptions = [
    { value: 'payer_mismatch', label: 'Payer Mismatch (%)' },
    { value: 'transaction_amount', label: 'Transaction Amount' },
    { value: 'transaction_count', label: 'Transaction Count (24h)' },
    { value: 'stores_distance', label: 'Stores Distance (km)' },
];

const operatorOptions = [
    { value: '<', label: '<' },
    { value: '<=', label: '<=' },
    { value: '>', label: '>' },
    { value: '>=', label: '>=' },
    { value: '=', label: '=' },
];


export function EditMisuseRulesSheet({
  open,
  onOpenChange,
  rules,
  onSave,
}: EditMisuseRulesSheetProps) {
  const [editedRules, setEditedRules] = useState<MisuseRule[]>(rules);

  useEffect(() => {
    if (open) {
      // Deep copy to prevent modifying the original state directly
      setEditedRules(JSON.parse(JSON.stringify(rules)));
    }
  }, [open, rules]);
  
  const handleSave = () => {
    onSave(editedRules);
  };

  const handleReset = () => {
    setEditedRules(JSON.parse(JSON.stringify(defaultRules)));
  };

  const handleRuleChange = (id: string, field: keyof MisuseRule, value: string) => {
    setEditedRules(prevRules => 
        prevRules.map(rule => rule.id === id ? { ...rule, [field]: value } : rule)
    );
  };

  const handleAddRule = () => {
    const newRule: MisuseRule = {
        id: Date.now().toString(),
        field: 'transaction_amount',
        operator: '>',
        value: '100',
    };
    setEditedRules(prevRules => [...prevRules, newRule]);
  };

  const handleRemoveRule = (id: string) => {
    setEditedRules(prevRules => prevRules.filter(rule => rule.id !== id));
  };


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Edit Misuse Detection Rules</SheetTitle>
          <SheetDescription>
            Modify the rules used by the AI to flag potential card misuse.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-4 py-4 overflow-y-auto">
            <Label>Business Rules</Label>
            <div className="space-y-3">
            {editedRules.map((rule, index) => (
                <div key={rule.id} className="flex items-center gap-2 p-3 border rounded-lg">
                   <div className="flex-1 grid grid-cols-3 gap-2">
                        <div>
                             <Label htmlFor={`field-${rule.id}`} className="sr-only">Field</Label>
                             <Select value={rule.field} onValueChange={(value) => handleRuleChange(rule.id, 'field', value)}>
                                <SelectTrigger id={`field-${rule.id}`}>
                                    <SelectValue placeholder="Select field..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {fieldOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                             <Label htmlFor={`operator-${rule.id}`} className="sr-only">Operator</Label>
                            <Select value={rule.operator} onValueChange={(value) => handleRuleChange(rule.id, 'operator', value)}>
                                <SelectTrigger id={`operator-${rule.id}`}>
                                    <SelectValue placeholder="Op..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {operatorOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div>
                             <Label htmlFor={`value-${rule.id}`} className="sr-only">Value</Label>
                            <Input
                                id={`value-${rule.id}`}
                                type="text"
                                value={rule.value}
                                onChange={(e) => handleRuleChange(rule.id, 'value', e.target.value)}
                                placeholder="Value"
                            />
                        </div>
                   </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveRule(rule.id)}>
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            </div>
             <Button variant="outline" size="sm" onClick={handleAddRule} className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Add Rule
            </Button>
            <p className="text-xs text-muted-foreground pt-4">
                These rules are provided to the AI as context.
            </p>
        </div>
        <SheetFooter className="mt-auto flex-shrink-0">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <div className="flex-grow" />
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </SheetClose>
          <Button onClick={handleSave}>
            Save Rules
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
