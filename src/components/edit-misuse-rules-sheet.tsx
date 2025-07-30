
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
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

type EditMisuseRulesSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rules: string;
  onSave: (rules: string) => void;
};

export const defaultRules = `1.  **Payer Mismatch:** A high percentage of transactions (e.g., >50%) made by someone other than the primary or secondary cardholder.
2.  **High Frequency:** Too many transactions in a short period (e.g., more than 3 transactions in 24 hours).
3.  **Anomalous Geographic Velocity:** Transactions in geographically distant locations in an impossible timeframe (e.g., London and New York on the same day).`;

export function EditMisuseRulesSheet({
  open,
  onOpenChange,
  rules,
  onSave,
}: EditMisuseRulesSheetProps) {
  const [editedRules, setEditedRules] = useState(rules);

  useEffect(() => {
    if (open) {
      setEditedRules(rules);
    }
  }, [open, rules]);
  
  const handleSave = () => {
    onSave(editedRules);
  };

  const handleReset = () => {
    setEditedRules(defaultRules);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Edit Misuse Detection Rules</SheetTitle>
          <SheetDescription>
            Modify the rules used by the AI to flag potential card misuse. Changes will be saved locally in your browser.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-4 py-4">
            <Label htmlFor="rules-textarea">Business Rules</Label>
            <Textarea
                id="rules-textarea"
                value={editedRules}
                onChange={(e) => setEditedRules(e.target.value)}
                className="h-80 min-h-64 font-mono text-sm"
                placeholder="Enter misuse detection rules..."
            />
            <p className="text-xs text-muted-foreground">
                These rules are provided to the AI as context. Use clear, specific language. Markdown is supported.
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
