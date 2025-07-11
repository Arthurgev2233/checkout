'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getAiGuidance } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { HelpCircle, Send, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  question: z.string().min(10, { message: 'Sua pergunta deve ter pelo menos 10 caracteres.' }).max(200, { message: 'Sua pergunta não pode ter mais de 200 caracteres.' }),
});

export function AiAssistant() {
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      question: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setAnswer(null);
    form.reset();
    const result = await getAiGuidance(data);

    if (result.success && result.data) {
      setAnswer(result.data);
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: result.error || "Algo deu errado.",
      });
    }
    setIsLoading(false);
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Dúvidas sobre Pix?</CardTitle>
            <CardDescription>Nosso assistente IA pode te ajudar!</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faça sua pergunta</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="Ex: Como sei se meu pagamento foi aprovado?" {...field} disabled={isLoading} />
                      <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" disabled={isLoading}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        
        {(isLoading || answer) && (
          <div className="mt-6 p-4 border rounded-lg bg-background/50 min-h-[108px]">
            {isLoading ? (
              <div className="space-y-2">
                 <div className="flex items-center gap-2 text-sm font-semibold text-primary/80 animate-pulse">
                    <Sparkles className="h-4 w-4"/>
                    <span>Buscando resposta...</span>
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : (
              answer && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <Sparkles className="h-4 w-4"/>
                        <span>Resposta do assistente</span>
                    </div>
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">{answer}</p>
                </div>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
