// src/components/configu-quote-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { handleGenerateQuoteRequest } from "@/lib/actions";
import type { GenerateQuoteRequestInput } from "@/ai/flows/generate-quote-request";
import { DatabaseZap, CalendarClock, ShieldCheck, Settings2, Loader2, FileText, AlertTriangle, Wand2, Send } from "lucide-react";

const formSchema = z.object({
  logsPerDayGb: z.coerce.number().positive({ message: "Daily logs must be a positive number." }).min(1, "Minimum 1 GB daily logs."),
  retentionDays: z.enum(["30", "60", "90"], {
    required_error: "Please select a retention period.",
  }),
  dataAtRestEncryptionRequired: z.boolean().default(false),
  operatingModel: z.enum(["fully managed", "managed", "self-serve"], {
    required_error: "Please select an operating model.",
  }),
});

export type ConfiguQuoteFormValues = z.infer<typeof formSchema>;

export function ConfiguQuoteForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [quoteRequest, setQuoteRequest] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ConfiguQuoteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      logsPerDayGb: 10, // Sensible default
      retentionDays: "30",
      dataAtRestEncryptionRequired: true,
      operatingModel: undefined,
    },
  });

  async function onSubmit(values: ConfiguQuoteFormValues) {
    setIsLoading(true);
    setQuoteRequest(null);
    setError(null);
    try {
      const result = await handleGenerateQuoteRequest(values as GenerateQuoteRequestInput);
      if (result.error) {
        setError(result.error);
        toast({ variant: "destructive", title: "Error Generating Quote", description: result.error });
      } else if (result.data) {
        setQuoteRequest(result.data.quoteRequest);
        toast({ title: "Quote Request Generated", description: "Your RFQ has been successfully created." });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
      setError(errorMessage);
      toast({ variant: "destructive", title: "Submission Error", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="logsPerDayGb"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center text-base">
                  <DatabaseZap className="mr-2 h-5 w-5 text-primary" />
                  Daily Log Volume (GB)
                </FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 50" {...field} className="text-base py-2 px-3" />
                </FormControl>
                <FormDescription>
                  Estimated amount of logs your system generates per day in Gigabytes.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="retentionDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center text-base">
                  <CalendarClock className="mr-2 h-5 w-5 text-primary" />
                  Data Retention Period
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="text-base py-2 px-3">
                      <SelectValue placeholder="Select retention period" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="60">60 Days</SelectItem>
                    <SelectItem value="90">90 Days</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  How long do you need to keep your data?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataAtRestEncryptionRequired"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-card">
                <div className="space-y-0.5">
                  <FormLabel className="flex items-center text-base">
                    <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
                    Data-at-Rest Encryption
                  </FormLabel>
                  <FormDescription>
                    Is encryption for data stored at rest a requirement?
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Data-at-rest encryption toggle"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="operatingModel"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="flex items-center text-base">
                  <Settings2 className="mr-2 h-5 w-5 text-primary" />
                  Operating Model
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="fully managed" />
                      </FormControl>
                      <FormLabel className="font-normal text-base">
                        Fully Managed
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="managed" />
                      </FormControl>
                      <FormLabel className="font-normal text-base">
                        Managed
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="self-serve" />
                      </FormControl>
                      <FormLabel className="font-normal text-base">
                        Self-Serve
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormDescription>
                  Choose the preferred operating model for the service.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto text-lg py-3 px-6 bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" />
                Generate Quote Request
              </>
            )}
          </Button>
        </form>
      </Form>

      {(quoteRequest || error) && <Separator className="my-8" />}

      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Generation Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {quoteRequest && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-primary">
              <FileText className="mr-2 h-6 w-6" />
              Your Generated Request for Quotation
            </CardTitle>
            <CardDescription>
              Below is the AI-generated RFQ based on your selections. You can copy and use this document.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={quoteRequest}
              rows={15}
              className="text-base bg-background/50 p-4 rounded-md shadow-inner focus:ring-primary"
              aria-label="Generated Quote Request"
            />
          </CardContent>
           <CardFooter>
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(quoteRequest)} className="w-full sm:w-auto">
              Copy to Clipboard
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
