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
import { Clipboard, ClipboardCheck, QrCode, Loader2, PartyPopper } from 'lucide-react';
import { generatePixPayment, checkPixStatus } from '@/app/actions';
import confetti from 'canvas-confetti';

interface PixData {
  transactionId: number;
  qrCodeImage: string;
  qrCodeText: string;
}

interface PixPaymentProps {
  price: number;
}

export function PixPayment({ price }: PixPaymentProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>('pending');
  const { toast } = useToast();

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);

  const handleGeneratePix = async () => {
    setIsLoading(true);
    setPixData(null);
    setPaymentStatus('pending');

    const result = await generatePixPayment({ amount: price });

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
  };

  return (
    <>
      <Card className="w-full shadow-lg transform hover:scale-[1.01] transition-transform duration-300">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <QrCode className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Pague com Pix</CardTitle>
              <CardDescription>
                Valor da assinatura: <span className="font-semibold text-primary">{formattedPrice}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center min-h-[150px]">
          <p className="text-muted-foreground text-center mb-6">
            Clique no botão abaixo para gerar o QR Code e o código para o pagamento. É rápido e seguro.
          </p>
          <Button onClick={handleGeneratePix} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              'Gerar Pix para Pagamento'
            )}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md" onEscapeKeyDown={closeModal}>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">Pagamento via PIX</DialogTitle>
            <DialogDescription className="text-center">
              Plano de Assinatura - Valor: {formattedPrice}
            </DialogDescription>
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
