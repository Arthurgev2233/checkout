import axios from 'axios';

const PUSHINPAY_API_URL = 'https://api.pushinpay.com.br/api';
const API_TOKEN = process.env.PUSHINPAY_API_TOKEN;

// Removida a verificação no nível do módulo para permitir que o erro seja tratado na chamada da função
// if (!API_TOKEN) {
//     console.error("PUSHINPAY_API_TOKEN is not set in the environment variables.");
// }

const api = axios.create({
  baseURL: PUSHINPAY_API_URL,
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

interface PushinPayPixResponse {
    id: number;
    qr_code: string;
    qr_code_base64: string;
    payment_url: string;
}

interface TransactionStatusResponse {
    status: 'pending' | 'paid' | 'expired' | 'failed';
}

export async function createPixCharge(amount: number) {
    if (!API_TOKEN) {
        throw new Error("PushinPay API token is not configured.");
    }
    
    const payload = {
        value: amount * 100, // API expects value in cents
        webhook_url: "https://seu-site.com/webhook", // As per your example
    };

    try {
        const response = await api.post<PushinPayPixResponse>('/pix/cashIn', payload);
        const { id, qr_code, qr_code_base64, payment_url } = response.data;
        
        return {
            transactionId: id,
            qrCodeText: qr_code,
            qrCodeImage: `data:image/png;base64,${qr_code_base64}`,
            paymentUrl: payment_url,
        };
    } catch (error: any) {
        console.error('Error creating Pushin Pay charge:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to create Pix charge with Pushin Pay');
    }
}

export async function checkTransactionStatus(transactionId: number) {
     if (!API_TOKEN) {
        throw new Error("PushinPay API token is not configured.");
    }

    try {
        const response = await api.get<TransactionStatusResponse>(`/transactions/${transactionId}`);
        return {
            status: response.data.status
        };
    } catch (error: any) {
        console.error('Error checking transaction status:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to check transaction status');
    }
}
