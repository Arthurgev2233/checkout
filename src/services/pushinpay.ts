import axios from 'axios';

// A URL base da API agora é gerenciada internamente para garantir consistência.
const PUSHINPAY_API_URL = 'https://api.pushinpay.com.br/api';
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
        value: amount * 100, // API espera o valor em centavos
        webhook_url: "https://seu-site.com/webhook",
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
        if (axios.isAxiosError(error)) {
             const apiError = error.response?.data?.message || error.message;
             console.error('Error creating Pushin Pay charge:', apiError);
             // Lança um erro mais detalhado para a action capturar
             throw new Error(`Falha ao criar cobrança Pix. Detalhe: ${apiError}`);
        }
       throw new Error('Ocorreu um erro desconhecido ao se comunicar com a API de pagamento.');
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
            const apiError = error.response?.data?.message || error.message;
            console.error('Error checking transaction status:', apiError);
            throw new Error(`Falha ao verificar o status da transação. Detalhe: ${apiError}`);
        }
        throw new Error('Ocorreu um erro desconhecido ao verificar o status do pagamento.');
    }
}
