'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Clipboard, ClipboardCheck, Download, QrCode } from 'lucide-react';

const PIX_KEY = 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8';
const QR_CODE_URL = 'https://placehold.co/300x300.png';

export function PixPayment() {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(PIX_KEY).then(() => {
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

  return (
    <Card className="w-full shadow-lg transform hover:scale-[1.01] transition-transform duration-300">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <QrCode className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Pague com Pix</CardTitle>
            <CardDescription>Para sua assinatura mensal</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        <div className="p-4 border-2 border-dashed rounded-lg bg-background">
          <a href={QR_CODE_URL} download="pix-qrcode.png">
            <Image
              src={QR_CODE_URL}
              alt="QR Code para pagamento Pix"
              width={250}
              height={250}
              className="rounded-md transition-opacity duration-500 opacity-0"
              data-ai-hint="qr code"
              onLoadingComplete={(image) => image.classList.remove('opacity-0')}
            />
          </a>
        </div>
        <div className="flex items-center text-muted-foreground w-full">
          <Separator className="flex-1" />
          <span className="px-4 text-sm">ou</span>
          <Separator className="flex-1" />
        </div>
        <div className="w-full space-y-2">
          <Label htmlFor="pix-key">Copie o código Pix</Label>
          <div className="flex space-x-2">
            <Input id="pix-key" readOnly value={PIX_KEY} className="font-mono text-sm bg-muted" />
            <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copiar chave Pix">
              {isCopied ? <ClipboardCheck className="text-green-500" /> : <Clipboard />}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 pt-0">
         <a href={QR_CODE_URL} download="pix-qrcode.png" className="w-full">
            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" size="lg">
              <Download className="mr-2 h-4 w-4" />
              Baixar QR Code
            </Button>
         </a>
        <CardDescription className="text-center text-xs px-4 pt-4">
          1. Abra o app do seu banco e escolha a opção Pix. <br/>
          2. Escaneie o QR Code ou cole a chave Pix. <br/>
          3. Confirme o valor e finalize o pagamento.
        </CardDescription>
      </CardFooter>
    </Card>
  );
}
