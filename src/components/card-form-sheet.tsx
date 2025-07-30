'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CardRecord } from '@/lib/types';
import { cardSchema } from '@/lib/types';
import { validateAddressAction } from '@/lib/actions';
import type { ValidateAddressOutput } from '@/ai/flows/validate-address';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/date-picker';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';

type CardFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: CardRecord | null;
  onSave: (data: CardRecord) => void;
};

export function CardFormSheet({
  open,
  onOpenChange,
  record,
  onSave,
}: CardFormSheetProps) {
  const form = useForm<CardRecord>({
    resolver: zodResolver(cardSchema),
    defaultValues: record || {},
  });

  const [isAddressValidating, setIsAddressValidating] = useState(false);
  const [addressValidationResult, setAddressValidationResult] =
    useState<ValidateAddressOutput | null>(null);

  useEffect(() => {
    if (open) {
      form.reset(record || {});
      setAddressValidationResult(null);
    }
  }, [open, record, form]);

  const handleValidateAddress = async () => {
    setIsAddressValidating(true);
    setAddressValidationResult(null);
    const addressData = form.getValues();
    const result = await validateAddressAction({
      add1: addressData.add1,
      add2: addressData.add2,
      add3: addressData.add3,
      add4: addressData.add4,
      add5: addressData.add5,
      postcode: addressData.postcode,
    });
    setAddressValidationResult(result);
    setIsAddressValidating(false);
  };

  const onSubmit = (data: CardRecord) => {
    onSave({ ...record, ...data });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>
            {record ? 'Edit Card Record' : 'Add New Card Record'}
          </SheetTitle>
          <SheetDescription>
            {record
              ? 'Update the details for this card record.'
              : 'Fill in the form to create a new card record.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <ScrollArea className="flex-1">
              <div className="space-y-6 p-1 pr-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Holder Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="staffId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Staff ID</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. S-12345" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Acme Corporation"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="primaryCardholderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Cardholder Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Address Details</CardTitle>
                    <CardDescription>
                      Enter the primary cardholder's address.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="add1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 1</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. 123 Main St"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="add2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 2</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Apt 4B" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="add3"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 3</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Building C" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="add4"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address Line 4</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. London" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="add5"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address Line 5</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. United Kingdom" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postcode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postcode</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. SW1A 0AA" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="overseas"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Overseas Address</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-col items-start gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleValidateAddress}
                        disabled={isAddressValidating}
                      >
                        {isAddressValidating ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Validate Address with AI
                      </Button>
                      {addressValidationResult && (
                        <Alert
                          variant={
                            addressValidationResult.isValid
                              ? 'default'
                              : 'destructive'
                          }
                        >
                          {addressValidationResult.isValid ? (
                            <Sparkles className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                          <AlertTitle>
                            {addressValidationResult.isValid
                              ? 'Address Validated'
                              : 'Validation Issues'}
                          </AlertTitle>
                          <AlertDescription>
                            {addressValidationResult.validationMessage}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Card Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                       <FormField
                        control={form.control}
                        name="primaryCardNumberBarcode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Card Number & Barcode</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="cardNumberEnding"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Card Number Ending</FormLabel>
                            <FormControl>
                              <Input placeholder="Last 4 digits" {...field} />
                            </FormControl>
                             <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="validFrom"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Valid From</FormLabel>
                            <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="expires"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Expires On</FormLabel>
                             <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="primaryCardIssueDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Primary Card Issue Date</FormLabel>
                             <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="primaryReplacementCardIssueDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Replacement Issue Date</FormLabel>
                             <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormItem>
                        )}
                      />
                    </div>
                     <FormField
                        control={form.control}
                        name="cardsToIssue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cards To Issue</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Secondary Card (Optional)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <FormField
                      control={form.control}
                      name="cardholderName2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secondary Cardholder Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Jane Smith" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="cardNumber2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secondary Card Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="magStripe2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secondary Mag Stripe</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                   <CardHeader>
                    <CardTitle>Flags & Configuration</CardTitle>
                  </CardHeader>
                   <CardContent className="space-y-4">
                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="letterFlag"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Letter Flag</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="nextPrimaryCardToBeCharged"
                        render={({ field }) => (
                           <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                             <div className="space-y-1 leading-none">
                              <FormLabel>Next card to be charged?</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
            <SheetFooter className="mt-auto flex-shrink-0 p-6 pt-4">
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit">
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
