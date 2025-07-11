'use server';

import { pixPaymentGuidance } from '@/ai/flows/pix-payment-guidance';
import { z } from 'zod';

const ActionInputSchema = z.object({
  question: z.string().min(10, { message: 'Sua pergunta deve ter pelo menos 10 caracteres.' }).max(200, { message: 'Sua pergunta não pode ter mais de 200 caracteres.' }),
});

export async function getAiGuidance(input: { question: string }) {
  try {
    const validatedInput = ActionInputSchema.safeParse(input);
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
