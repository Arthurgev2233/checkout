'use server';

import { createPixCharge, checkTransactionStatus } from '@/services/pushinpay';
import { z } from 'zod';

const PaymentActionInputSchema = z.object({
  amount: z.number().positive(),
});

export async function generatePixPayment(input: { amount: number }) {
    try {
        const validatedInput = PaymentActionInput.safeParse(input);
        if (!validatedInput.success) {
            return { success: false, error: 'Valor inválido.' };
        }
        
        const pixData = await createPixCharge(validatedInput.data.amount);
        return { success: true, data: pixData };

    } catch (error: any) {
        console.error('Pushin Pay API error:', error.message);
        return { success: false, error: 'Não foi possível gerar o Pix. Verifique o token da API e tente novamente.' };
    }
}


const CheckStatusInputSchema = z.object({
  transactionId: z.number(),
});

export async function checkPixStatus(input: { transactionId: number }) {
  try {
    const validatedInput = CheckStatusInputSchema.safeParse(input);
    if (!validatedInput.success) {
      return { success: false, error: 'ID da transação inválido.' };
    }
    const statusData = await checkTransactionStatus(validatedInput.data.transactionId);
    return { success: true, data: statusData };
  } catch (error: any) {
    return { success: false, error: 'Não foi possível verificar o status do pagamento.' };
  }
}
