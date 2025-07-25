import { SubscriptionPlans } from '@/components/subscription-plans';
import { AiAssistant } from '@/components/ai-assistant';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <main className="w-full max-w-4xl mx-auto">
        <header className="flex flex-col items-center mb-8 text-center">
          <Image
            src="https://cdn.imgchest.com/files/7lxcpdr3jo7.png"
            alt="Privacy Logo"
            width={222}
            height={48}
            className="mb-4"
            data-ai-hint="logo privacy"
            priority
          />
          <p className="mt-2 text-lg text-foreground font-semibold max-w-2xl">
            Escolha o plano da sua assinatura:
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="w-full lg:col-span-1">
            <SubscriptionPlans />
          </div>
          <div className="w-full lg:col-span-1">
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
