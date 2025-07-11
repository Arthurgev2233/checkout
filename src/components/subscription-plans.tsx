'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Clipboard, ClipboardCheck, Loader2, CheckCircle, Gift } from 'lucide-react';
import { generatePixPayment, checkPixStatus } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

declare global {
  interface Window {
    fbq?: (action: string, event: string, params?: any) => void;
  }
}

interface PixData {
  transactionId: number;
  qrCodeImage: string;
  qrCodeText: string;
}

interface Plan {
  name: string;
  price: number;
  description: string;
  badgeText?: string;
}

const allPlans: Plan[] = [
  { name: '30 DIAS', price: 3.50, description: 'Acesso completo por 30 dias.', badgeText: 'Mais comprado 🔥' },
  { name: '90 DIAS', price: 47.00, description: 'Acesso completo por 90 dias.', badgeText: 'Economia' },
  { name: '1 ANO', price: 87.00, description: 'Acesso completo por 1 ano.', badgeText: 'Melhor oferta' },
];

export function SubscriptionPlans() {
  const [isCopied, setIsCopied] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>('pending');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const { toast } = useToast();
  
  const handleGeneratePix = async (plan: Plan) => {
    setSelectedPlan(plan);
    setIsLoading(true);
    setPixData(null);
    setPaymentStatus('pending');
    setIsModalOpen(true);
    
    if (window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        value: plan.price,
        currency: 'BRL',
        content_name: plan.name,
      });
    }

    const result = await generatePixPayment({ amount: plan.price });

    if (result.success && result.data) {
      setPixData(result.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar Pix',
        description: result.error || 'Algo deu errado. Tente novamente.',
      });
      setIsModalOpen(false);
    }
    setIsLoading(false);
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
  
  const handlePaymentSuccess = useCallback(() => {
    setPaymentStatus('paid');
    if (window.fbq && selectedPlan) {
      window.fbq('track', 'Purchase', {
        value: selectedPlan.price,
        currency: 'BRL',
        content_name: selectedPlan.name,
      });
    }
  }, [selectedPlan]);


  const pollPaymentStatus = useCallback(async () => {
    if (!pixData?.transactionId || paymentStatus === 'paid') return;

    const result = await checkPixStatus({ transactionId: pixData.transactionId });
    if (result.success && result.data?.status === 'paid') {
      handlePaymentSuccess();
    }
  }, [pixData, paymentStatus, handlePaymentSuccess]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isModalOpen && paymentStatus === 'pending' && pixData?.transactionId) {
      interval = setInterval(pollPaymentStatus, 3000); // Check every 3 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isModalOpen, paymentStatus, pixData, pollPaymentStatus]);

  const closeModal = () => {
    setIsModalOpen(false);
    setPixData(null);
    setSelectedPlan(null);
    setPaymentStatus('pending'); // Reset status on close
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);

  return (
    <>
      <div className="space-y-4">
        {allPlans.map((plan) => (
          <Card key={plan.name} className="w-full shadow-lg flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <Image
                      src="https://cdn.imgchest.com/files/yd5cer656g4.png"
                      alt="Ícone do plano"
                      width={40}
                      height={40}
                      className="rounded-full"
                      data-ai-hint="crown icon"
                   />
                  <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                </div>
                {plan.badgeText && (
                  <Badge variant="outline" className="text-accent border-accent/80">{plan.badgeText}</Badge>
                )}
              </div>
              <CardDescription className="pt-2">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">
                Valor: <span className="font-bold text-xl text-foreground">{formatPrice(plan.price)}</span>
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleGeneratePix(plan)} 
                size="lg" 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" 
                disabled={isLoading && selectedPlan?.name === plan.name}
              >
                {isLoading && selectedPlan?.name === plan.name ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  'Assinar agora'
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md" onEscapeKeyDown={closeModal}>
          {paymentStatus === 'paid' ? (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <DialogTitle className="text-2xl font-bold">Pagamento Confirmado!</DialogTitle>
              <DialogDescription className="mt-2">
                Sua assinatura foi ativada com sucesso.
              </DialogDescription>
              <p className="text-sm text-muted-foreground mt-4">
                Clique no botão abaixo para acessar seu conteúdo exclusivo.
              </p>
              <Button asChild size="lg" className="w-full mt-6 bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
                <Link href="https://privacy.com.br/" target="_blank">
                  <Gift className="mr-2" />
                  Acessar Conteúdo
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                 <div className="flex justify-center mb-2">
                    <Image
                      src="https://cdn.imgchest.com/files/7lxcpdr3jo7.png"
                      alt="Privacy Logo"
                      width={120}
                      height={32}
                      data-ai-hint="logo"
                    />
                  </div>
                <DialogTitle className="text-center text-2xl font-bold">Pagamento via PIX</DialogTitle>
                {selectedPlan && (
                  <DialogDescription className="text-center text-accent font-semibold">
                    Plano {selectedPlan.name} - Valor: {formatPrice(selectedPlan.price)}
                  </DialogDescription>
                )}
              </DialogHeader>
              <div className="flex flex-col items-center justify-center p-4">
                {isLoading || !pixData ? (
                  <div className="flex flex-col items-center justify-center space-y-4 my-8">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">Gerando seu código Pix...</p>
                  </div>
                ) : (
                  <>
                    <p className="text-center text-foreground mb-4">
                      Abra o app do seu banco, escaneie o QR Code ou copie o código abaixo.
                    </p>
                    <div className="p-2 border-2 border-dashed border-accent rounded-lg bg-background mb-4">
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
                          className="w-full min-w-0 flex-1 bg-muted border-accent/50 border rounded-l-md px-3 py-2 text-sm font-mono text-muted-foreground"
                        />
                        <Button variant="outline" size="icon" className="rounded-l-none border-accent/50" onClick={handleCopy} aria-label="Copiar chave Pix">
                          {isCopied ? <ClipboardCheck className="text-green-500" /> : <Clipboard className="text-accent" />}
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 text-center text-sm text-muted-foreground animate-pulse">
                      <p>Aguardando confirmação do pagamento...</p>
                    </div>
                  </>
                )}
              </div>
              <DialogFooter className="sm:justify-center">
                <Button type="button" onClick={closeModal} className="bg-accent/10 text-accent hover:bg-accent/20">
                  Fechar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
