'use server';

import { pixPaymentGuidance } from '@/ai/flows/pix-payment-guidance';
import { createPixCharge } from '@/services/pushinpay';
import { z } from 'zod';

const AiActionInputSchema = z.object({
  question: z.string().min(10, { message: 'Sua pergunta deve ter pelo menos 10 caracteres.' }).max(200, { message: 'Sua pergunta não pode ter mais de 200 caracteres.' }),
});

export async function getAiGuidance(input: { question: string }) {
  try {
    const validatedInput = AiActionInputSchema.safeParse(input);
    if (!validatedInput.success) {
      return { success: false, error: validatedInput.error.format().question?._errors[0] };
    }
    
    const result = await pixPaymentGuidance(validatedInput.data);
    return { success: true, data: result.answer };
  } catch (error) {
    console.error('AI guidance error:', error);
    return { success: false, error: 'Ocorreu um erro ao buscar a resposta. Tente novamente mais tarde.' };
  }
}

const PaymentActionInputSchema = z.object({
  amount: z.number().positive(),
});

export async function generatePixPayment(input: { amount: number }) {
    try {
        const validatedInput = PaymentActionInputSchema.safeParse(input);
        if (!validatedInput.success) {
            return { success: false, error: 'Valor inválido.' };
        }
        
        const pixData = await createPixCharge(validatedInput.data.amount);
        return { success: true, data: pixData };

    } catch (error: any) {
        console.error('Pushin Pay API error:', error.response?.data || error.message);
        return { success: false, error: 'Não foi possível gerar o Pix. Verifique o token da API e tente novamente.' };
    }
}
