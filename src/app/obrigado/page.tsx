'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Download, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';

export default function ObrigadoPage() {
  useEffect(() => {
    confetti({
      particleCount: 200,
      spread: 90,
      origin: { y: 0.6 },
      zIndex: 1000,
    });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <main className="w-full max-w-md mx-auto">
        <Card className="text-center shadow-2xl animate-fade-in">
          <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="mt-4 text-3xl font-bold text-foreground">
              Pagamento Confirmado!
            </CardTitle>
            <CardDescription className="mt-2 text-lg text-muted-foreground">
              Sua assinatura foi ativada com sucesso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Obrigado por sua confiança! Clique no botão abaixo para acessar seu conteúdo exclusivo imediatamente.
            </p>
            <div className="flex flex-col items-center space-y-4">
               <Image
                  src="https://cdn.imgchest.com/files/7lxcpdr3jo7.png"
                  alt="Privacy Logo"
                  width={150}
                  height={32}
                  className="mb-4"
                  data-ai-hint="logo privacy"
                />
              <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg">
                <Link href="https://privacy.com.br/" target="_blank">
                  <Gift className="mr-2" />
                  Acessar Conteúdo Exclusivo
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <footer className="text-center mt-8 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Privacy. Todos os direitos reservados.</p>
        </footer>
      </main>
    </div>
  );
}
