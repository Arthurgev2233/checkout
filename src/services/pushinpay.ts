import axios from 'axios';

// Utiliza a variável de ambiente para a URL da API, com um valor padrão para o domínio principal.
const PUSHINPAY_API_URL = process.env.PIX_API_URL || 'https://api.pushinpay.com.br/api';
const API_TOKEN = process.env.PIX_API_TOKEN;

const api = axios.create({
  baseURL: PUSHINPAY_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(config => {
    if (!API_TOKEN) {
        throw new Error("A chave da API de pagamento (PIX_API_TOKEN) não foi definida no servidor.");
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
    if (!API_TOKEN) {
        throw new Error("A chave da API de pagamento (PIX_API_TOKEN) não foi definida no servidor.");
    }
    
    const payload = {
        value: amount * 100, // API expects value in cents
        webhook_url: "https://seu-site.com/webhook",
    };

    try {
        // O caminho agora é relativo à URL base correta
        const response = await api.post<PushinPayPixResponse>('/pix/cashIn', payload);
        const { id, qr_code, qr_code_base64, payment_url } = response.data;
        
        return {
            transactionId: id,
            qrCodeText: qr_code,
            qrCodeImage: `data:image/png;base64,${qr_code_base64}`,
            paymentUrl: payment_url,
        };
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
             console.error('Error creating Pushin Pay charge:', error.response?.data || error.message);
             // Lança um erro mais detalhado para a action capturar
             throw new Error(error.response?.data?.message || 'Falha ao criar cobrança Pix. Verifique as credenciais e a URL da API.');
        }
       throw error;
    }
}

export async function checkTransactionStatus(transactionId: number) {
    if (!API_TOKEN) {
        throw new Error("A chave da API de pagamento (PIX_API_TOKEN) não foi definida no servidor.");
    }

    try {
        const response = await api.get<TransactionStatusResponse>(`/transactions/${transactionId}`);
        return {
            status: response.data.status
        };
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            console.error('Error checking transaction status:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Falha ao verificar o status da transação.');
        }
        throw error;
    }
}
