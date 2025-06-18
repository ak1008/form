import { ConfiguQuoteForm } from '@/components/configu-quote-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSignature } from 'lucide-react'; // Using a relevant icon

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-10 bg-background font-body">
      <Card className="w-full max-w-3xl shadow-2xl rounded-xl overflow-hidden">
        <CardHeader className="text-center bg-primary/5 p-6 sm:p-8">
          <div className="flex justify-center mb-4">
             <FileSignature className="h-16 w-16 text-primary" strokeWidth={1.5} />
          </div>
          <CardTitle className="text-4xl font-headline tracking-tight text-primary">
            ConfiguQuote
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Configure your requirements and let AI draft your Request for Quotation.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <ConfiguQuoteForm />
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} ConfiguQuote. All rights reserved.</p>
      </footer>
    </main>
  );
}
