import axios from 'axios';

const PUSHINPAY_API_URL = 'https://api.pushinpay.com.br/api';
const API_TOKEN = process.env.PUSHINPAY_API_TOKEN;

const api = axios.create({
  baseURL: PUSHINPAY_API_URL,
  headers: {
    // O token será adicionado por um interceptor para garantir que ele seja verificado a cada requisição.
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Adiciona um interceptor para verificar e injetar o token em cada requisição
api.interceptors.request.use(config => {
    if (!API_TOKEN) {
        // Lança um erro claro que pode ser capturado pelo nosso action.
        throw new Error("PushinPay API token is not configured.");
    }
    config.headers.Authorization = `Bearer ${API_TOKEN}`;
    return config;
}, error => {
    return Promise.reject(error);
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
        // Se o erro foi lançado pelo interceptor, ele será repassado.
        if (axios.isAxiosError(error)) {
             console.error('Error creating Pushin Pay charge:', error.response?.data || error.message);
             throw new Error(error.response?.data?.message || 'Failed to create Pix charge with Pushin Pay');
        }
       // Repassa o erro do interceptor
       throw error;
    }
}

export async function checkTransactionStatus(transactionId: number) {
    try {
        const response = await api.get<TransactionStatusResponse>(`/transactions/${transactionId}`);
        return {
            status: response.data.status
        };
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            console.error('Error checking transaction status:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to check transaction status');
        }
        // Repassa o erro do interceptor
        throw error;
    }
}
