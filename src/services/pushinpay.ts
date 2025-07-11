import axios from 'axios';

const PUSHINPAY_API_URL = 'https://api.pushinpay.com.br/api';
const API_TOKEN = process.env.PUSHINPAY_API_TOKEN;

if (!API_TOKEN) {
    console.error("PUSHINPAY_API_TOKEN is not set in the environment variables.");
}

const api = axios.create({
  baseURL: PUSHINPAY_API_URL,
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

interface PushinPayPixResponse {
    transaction: {
        id: number;
        qr_code_text: string;
        qr_code_image: string;
    };
}

export async function createPixCharge(amount: number) {
    if (!API_TOKEN) {
        throw new Error("PushinPay API token is not configured.");
    }
    
    const amountInCents = Math.round(amount * 100);

    const payload = {
        amount: amountInCents,
        description: `Pagamento de assinatura no valor de R$${amount.toFixed(2)}`,
        payment_method: "pix",
        postback_url: "https://your-domain.com/webhook/pushinpay", 
        customer: {
            name: "Cliente Teste",
            email: "cliente.teste@example.com",
            document: "01234567890" 
        }
    };

    try {
        const response = await api.post<PushinPayPixResponse>('/transaction', payload);
        const { transaction } = response.data;
        
        return {
            transactionId: transaction.id,
            qrCodeText: transaction.qr_code_text,
            qrCodeImage: transaction.qr_code_image,
        };
    } catch (error: any) {
        console.error('Error creating Pushin Pay charge:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to create Pix charge with Pushin Pay');
    }
}
