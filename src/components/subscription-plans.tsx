
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Clipboard, ClipboardCheck, Loader2, PartyPopper } from 'lucide-react';
import { generatePixPayment, checkPixStatus } from '@/app/actions';
import confetti from 'canvas-confetti';
import { Badge } from '@/components/ui/badge';

interface PixData {
  transactionId: number;
  qrCodeImage: string;
  qrCodeText: string;
}

interface Plan {
  name: string;
  price: number;
  description: string;
  isPopular?: boolean;
}

const plans: Plan[] = [
  { name: '30 DIAS', price: 3.50, description: 'Acesso completo por 30 dias.', isPopular: true },
  { name: '90 DIAS', price: 47.00, description: 'Acesso completo por 90 dias.' },
  { name: '1 ANO', price: 87.00, description: 'Acesso completo por 1 ano.' },
];

export function SubscriptionPlans() {
  const [isCopied, setIsCopied] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>('pending');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const { toast } = useToast();

  const handleGeneratePix = async (plan: Plan) => {
    setIsLoading(plan.name);
    setPixData(null);
    setPaymentStatus('pending');
    setSelectedPlan(plan);

    const result = await generatePixPayment({ amount: plan.price });

    if (result.success && result.data) {
      setPixData(result.data);
      setIsModalOpen(true);
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar Pix',
        description: result.error || 'Algo deu errado. Tente novamente.',
      });
    }
    setIsLoading(null);
  };

  const handleCopy = () => {
    if (!pixData?.qrCodeText) return;
    navigator.clipboard.writeText(pixData.qrCodeText).then(() => {
      setIsCopied(true);
      toast({
        title: 'Chave Pix copiada!',
        description: 'Agora você pode colar no seu app do banco.',
      });
      setTimeout(() => setIsCopied(false), 3000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        variant: 'destructive',
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar a chave Pix. Tente manualmente.',
      });
    });
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const pollPaymentStatus = useCallback(async () => {
    if (!pixData?.transactionId || paymentStatus === 'paid') return;

    const result = await checkPixStatus({ transactionId: pixData.transactionId });
    if (result.success && result.data?.status === 'paid') {
      setPaymentStatus('paid');
      triggerConfetti();
    }
  }, [pixData, paymentStatus]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isModalOpen && paymentStatus === 'pending' && pixData?.transactionId) {
      interval = setInterval(pollPaymentStatus, 5000); // Poll every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isModalOpen, paymentStatus, pixData, pollPaymentStatus]);

  const closeModal = () => {
    setIsModalOpen(false);
    setPixData(null);
    setSelectedPlan(null);
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);

  return (
    <>
      <div className="space-y-4">
        {plans.map((plan) => (
          <Card key={plan.name} className="w-full shadow-lg transform hover:scale-[1.01] transition-transform duration-300">
            <CardHeader>
              <div className="flex items-center space-x-3">
                 <Image
                    src="https://cdn.imgchest.com/files/yd5cer656g4.png"
                    alt="Ícone do Plano"
                    width={40}
                    height={40}
                    className="rounded-full"
                    data-ai-hint="logo icon"
                  />
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                    {plan.isPopular && (
                      <Badge variant="outline" className="text-accent border-accent/80">Mais comprado 🔥</Badge>
                    )}
                  </div>
                  <CardDescription>
                    Valor: <span className="font-semibold text-primary">{formatPrice(plan.price)}</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col items-start justify-center">
              <p className="text-muted-foreground mb-4">
                {plan.description}
              </p>
              <Button onClick={() => handleGeneratePix(plan)} size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={!!isLoading}>
                {isLoading === plan.name ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  'Assinar agora'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md" onEscapeKeyDown={closeModal}>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">Pagamento via PIX</DialogTitle>
            {selectedPlan && (
              <DialogDescription className="text-center">
                Plano {selectedPlan.name} - Valor: {formatPrice(selectedPlan.price)}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            {paymentStatus === 'paid' ? (
              <div className="flex flex-col items-center text-center space-y-4 my-8">
                <PartyPopper className="h-16 w-16 text-green-500" />
                <h3 className="text-2xl font-bold text-green-600">Pagamento Confirmado!</h3>
                <p className="text-muted-foreground">Obrigado! Seu acesso está liberado.</p>
              </div>
            ) : (
              <>
                {pixData ? (
                  <>
                    <p className="text-center text-muted-foreground mb-4">
                      Abra o app do seu banco, escaneie o QR Code ou copie o código abaixo.
                    </p>
                    <div className="p-2 border-2 border-dashed rounded-lg bg-background mb-4">
                       <Image
                        src={pixData.qrCodeImage}
                        alt="QR Code para pagamento Pix"
                        width={220}
                        height={220}
                        className="rounded-md"
                      />
                    </div>
                    <div className="w-full space-y-2">
                      <div className="flex w-full">
                        <input
                          id="pix-key"
                          readOnly
                          value={pixData.qrCodeText}
                          className="w-full min-w-0 flex-1 bg-muted border-input border rounded-l-md px-3 py-2 text-sm font-mono text-muted-foreground"
                        />
                        <Button variant="outline" size="icon" className="rounded-l-none" onClick={handleCopy} aria-label="Copiar chave Pix">
                          {isCopied ? <ClipboardCheck className="text-green-500" /> : <Clipboard />}
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 text-center text-sm text-muted-foreground animate-pulse">
                      <p>Aguardando confirmação do pagamento...</p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-4 my-8">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">Gerando seu código Pix...</p>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter className="sm:justify-center">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
