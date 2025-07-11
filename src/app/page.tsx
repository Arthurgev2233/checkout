import { PixPayment } from '@/components/pix-payment';
import { AiAssistant } from '@/components/ai-assistant';
import Image from 'next/image';

export default function Home() {
  const subscriptionPrice = "R$3,50";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <main className="w-full max-w-4xl mx-auto">
        <header className="flex flex-col items-center mb-8 text-center">
          <Image
            src="https://placehold.co/445x97.png"
            alt="Privacy Logo"
            width={222}
            height={48}
            className="mb-4"
            data-ai-hint="logo privacy"
            priority
          />
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
            Realize o pagamento de <span className="font-semibold text-primary">{subscriptionPrice}</span> da sua assinatura de forma rápida e segura com Pix.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="w-full">
            <PixPayment price={3.50} />
          </div>
          <div className="w-full">
            <AiAssistant />
          </div>
        </div>
        <footer className="text-center mt-12 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Privacy. Todos os direitos reservados.</p>
        </footer>
      </main>
    </div>
  );
}
