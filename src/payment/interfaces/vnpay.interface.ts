export interface VNPayConfig {
    tmnCode: string;
    hashSecret: string;
    vnpUrl: string;
    returnUrl: string;
  }
  
  export interface PaymentOrder {
    amount: number;
    orderInfo: string;
    orderType: string;
    bankCode?: string;
    language?: string;
  }