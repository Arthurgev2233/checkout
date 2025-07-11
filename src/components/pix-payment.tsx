
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Clipboard, ClipboardCheck, Download, QrCode, Loader2 } from 'lucide-react';
import { generatePixPayment } from '@/app/actions';
import { Skeleton } from './ui/skeleton';

interface PixData {
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
  const { toast } = useToast();

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);

  const handleGeneratePix = async () => {
    setIsLoading(true);
    setPixData(null);
    const result = await generatePixPayment({ amount: price });

    if (result.success && result.data) {
      setPixData(result.data);
    } else {
      toast({
        variant: "destructive",
        title: "Erro ao gerar Pix",
        description: result.error || "Algo deu errado. Tente novamente.",
      });
    }
    setIsLoading(false);
  };

  const handleCopy = () => {
    if (!pixData?.qrCodeText) return;
    navigator.clipboard.writeText(pixData.qrCodeText).then(() => {
      setIsCopied(true);
      toast({
        title: "Chave Pix copiada!",
        description: "Agora você pode colar no seu app do banco.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        variant: "destructive",
        title: "Erro ao copiar",
        description: "Não foi possível copiar a chave Pix. Tente novamente.",
      });
    });
  };
  
  const handleDownloadQrCode = () => {
    if (!pixData?.qrCodeImage) return;
    const link = document.createElement('a');
    link.href = pixData.qrCodeImage;
    link.download = 'pix-qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Card className="w-full shadow-lg transform hover:scale-[1.01] transition-transform duration-300">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <QrCode className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Pague com Pix</CardTitle>
            <CardDescription>Valor da assinatura: <span className="font-semibold text-primary">{formattedPrice}</span></CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-center space-y-6 min-h-[380px]">
        {!pixData && !isLoading && (
            <div className='flex flex-col items-center justify-center h-full text-center gap-4 py-16'>
                <p className='text-muted-foreground'>Clique no botão abaixo para gerar o QR Code e o código para o pagamento.</p>
                <Button onClick={handleGeneratePix} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    Gerar Pix para Pagamento
                </Button>
            </div>
        )}

        {isLoading && (
             <div className="flex flex-col items-center justify-center space-y-4 pt-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Gerando seu código Pix...</p>
                <Skeleton className="h-[250px] w-[250px] rounded-lg" />
            </div>
        )}

        {pixData && (
          <>
            <div className="p-4 border-2 border-dashed rounded-lg bg-background">
              <Image
                src={pixData.qrCodeImage}
                alt="QR Code para pagamento Pix"
                width={250}
                height={250}
                className="rounded-md transition-opacity duration-500 opacity-0"
                onLoad={(event) => event.currentTarget.classList.remove('opacity-0')}
              />
            </div>
            <div className="flex items-center text-muted-foreground w-full">
              <Separator className="flex-1" />
              <span className="px-4 text-sm">ou</span>
              <Separator className="flex-1" />
            </div>
            <div className="w-full space-y-2">
              <Label htmlFor="pix-key">Copie o código Pix</Label>
              <div className="flex space-x-2">
                <Input id="pix-key" readOnly value={pixData.qrCodeText} className="font-mono text-sm bg-muted" />
                <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copiar chave Pix">
                  {isCopied ? <ClipboardCheck className="text-green-500" /> : <Clipboard />}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>

      {pixData && (
        <CardFooter className="flex flex-col space-y-4 pt-0">
          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" size="lg" onClick={handleDownloadQrCode}>
            <Download className="mr-2 h-4 w-4" />
            Baixar QR Code
          </Button>
          <CardDescription className="text-center text-xs px-4 pt-4">
            1. Abra o app do seu banco e escolha a opção Pix. <br/>
            2. Escaneie o QR Code ou cole a chave Pix. <br/>
            3. Confirme o valor de {formattedPrice} e finalize o pagamento.
          </CardDescription>
        </CardFooter>
      )}
    </Card>
  );
}
