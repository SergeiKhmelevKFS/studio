
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
  FormDescription,
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
import { Loader2, Sparkles, AlertCircle, Search, ChevronsUpDown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';


type CardFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: CardRecord | null;
  onSave: (data: CardRecord) => void;
  isReadOnly: boolean;
};

export function CardFormSheet({
  open,
  onOpenChange,
  record,
  onSave,
  isReadOnly,
}: CardFormSheetProps) {
  const form = useForm<CardRecord>({
    resolver: zodResolver(cardSchema),
    defaultValues: record || {},
  });

  const [isAddressValidating, setIsAddressValidating] = useState(false);
  const [addressValidationResult, setAddressValidationResult] =
    useState<ValidateAddressOutput | null>(null);
  const [isCardGenerated, setIsCardGenerated] = useState(false);
  const [isSecondaryCardGenerated, setIsSecondaryCardGenerated] = useState(false);

  const isCardActive = form.watch('active');

  useEffect(() => {
    if (open) {
      // If we are creating a new record, generate a random staff ID
      const initialValues = record ? record : {
        ...cardSchema.partial().default,
        staffId: `${Math.floor(100000 + Math.random() * 900000)}`,
        companyName: 'B&Q',
        active: true,
      };
      form.reset(initialValues as CardRecord);
      setAddressValidationResult(null);
      setIsCardGenerated(!!record); // If editing a record, card is already generated
      setIsSecondaryCardGenerated(!!record?.cardholderName2);
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
  
  const handleGenerateCard = () => {
    const staffId = form.getValues('staffId') || '';
    const numericStaffId = staffId.replace(/\D/g, ''); // Remove non-digits
    const cardNumber = `635666${numericStaffId}`;
    form.setValue('primaryCardNumberBarcode', cardNumber);
    form.setValue('primaryCardIssueDate', new Date());
    setIsCardGenerated(true);
  };

  const handleGenerateSecondaryCard = () => {
    setIsSecondaryCardGenerated(true);
  };

  const onSubmit = (data: CardRecord) => {
    if(isReadOnly) return;
    onSave({ ...record, ...data });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>
            {isReadOnly ? 'View Card Record' : record ? 'Edit Card Record' : 'Add New Card Record'}
          </SheetTitle>
          <SheetDescription>
            {isReadOnly ? 'Viewing card record details.' : record
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
                <fieldset disabled={isReadOnly} className="space-y-6 group">
                  {!record && (
                    <Card>
                      <CardHeader>
                        <CardTitle>User Search</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center gap-4">
                        <Input
                          placeholder="Enter user details to search"
                          className="flex-grow"
                        />
                        <Button type="button">
                          <Search className="mr-2 h-4 w-4" />
                          Search
                        </Button>
                      </CardContent>
                    </Card>
                  )}
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
                                <Input
                                  placeholder="e.g. 123456"
                                  {...field}
                                  disabled
                                />
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
                                  disabled
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
                  </fieldset>

                  <Collapsible asChild>
                    <Card>
                      <div className="flex items-center justify-between p-6 pb-0">
                        <CardHeader className="p-0">
                          <CardTitle>Address Details</CardTitle>
                          <CardDescription>
                            Enter the primary cardholder's address.
                          </CardDescription>
                        </CardHeader>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-9 p-0">
                            <ChevronsUpDown className="h-4 w-4" />
                            <span className="sr-only">Toggle</span>
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      <CollapsibleContent>
                      <fieldset disabled={isReadOnly} className="group">
                        <CardContent className="space-y-4 pt-6">
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
                                  <Input
                                    placeholder="e.g. Apt 4B"
                                    {...field}
                                  />
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
                                  <Input
                                    placeholder="e.g. Building C"
                                    {...field}
                                  />
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
                                    <Input
                                      placeholder="e.g. London"
                                      {...field}
                                    />
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
                                    <Input
                                      placeholder="e.g. United Kingdom"
                                      {...field}
                                    />
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
                                    <Input
                                      placeholder="e.g. SW1A 0AA"
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
                        </CardContent>
                        </fieldset>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>

                  <fieldset disabled={isReadOnly} className="space-y-6 group">
                  <Card>
                    <CardHeader>
                      <CardTitle>Primary Card Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    {!isCardGenerated && !record ? (
                        <Button
                          type="button"
                          onClick={handleGenerateCard}
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Card
                        </Button>
                      ) : (
                        <>
                          {(record || isCardGenerated) && 
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="active"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">
                                      Card Active
                                    </FormLabel>
                                    <FormDescription>
                                      Deactivating the card will prevent its use.
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            {!isCardActive && (
                                <FormField
                                  control={form.control}
                                  name="reason"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Reason for deactivation</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Enter reason..."
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}
                            </div>
                          }
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="primaryCardNumberBarcode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Primary Card Number</FormLabel>
                                  <FormControl>
                                    <Input {...field} disabled />
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
                                    disabled={!!record}
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
                                    disabled
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
                                    disabled
                                  />
                                </FormItem>
                              )}
                            />
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Secondary Card Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!isSecondaryCardGenerated ? (
                        <div className="flex flex-col items-start gap-2">
                          <Button
                            type="button"
                            onClick={handleGenerateSecondaryCard}
                            disabled={!isCardGenerated}
                          >
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Secondary Card
                          </Button>
                          {!isCardGenerated && (
                             <p className="text-sm text-muted-foreground">
                             Requires Generating Primary Card
                           </p>
                          )}
                        </div>
                      ) : (
                        <>
                          <FormField
                            control={form.control}
                            name="cardholderName2"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Secondary Cardholder Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g. Jane Smith"
                                    {...field}
                                  />
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
                                    <Input {...field} disabled />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </>
                      )}
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
                </fieldset>
              </div>
            </ScrollArea>
            <SheetFooter className="mt-auto flex-shrink-0 p-6 pt-4">
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              {!isReadOnly && (
                <Button type="submit">
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              )}
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
