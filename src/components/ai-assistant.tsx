'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const faqItems = [
  {
    question: "Como sei que meu pagamento foi aprovado?",
    answer: "Assim que o pagamento PIX for confirmado pelo banco, a página será atualizada automaticamente, mostrando a confirmação. Você também receberá uma notificação."
  },
  {
    question: "O acesso ao conteúdo é imediato?",
    answer: "Sim! Após a confirmação do pagamento, você será redirecionado e seu acesso ao conteúdo exclusivo será liberado instantaneamente."
  },
  {
    question: "Minha compra é sigilosa?",
    answer: "Sim, sua privacidade é nossa prioridade. Todos os pagamentos e informações são processados de forma 100% segura e sigilosa. Nenhuma informação sobre a compra aparecerá na sua fatura."
  },
  {
    question: "Quais são as formas de pagamento?",
    answer: "No momento, aceitamos exclusivamente pagamentos via PIX para garantir uma aprovação rápida e segura para você."
  }
];

export function AiAssistant() {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="bg-accent/10 p-2 rounded-full">
            <HelpCircle className="h-6 w-6 text-accent" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Dúvidas sobre o pagamento</CardTitle>
            <CardDescription>Após a confirmação rápida do pagamento você será redirecionado para os conteúdos da modelo.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
