export interface Plan {
  name: string;
  price: string;
  planType: string;
  features: string[];
  isAnnual?: boolean;
  isDesconto?: boolean;
  affiliateDiscount?: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  country: string;
  customCountry?: string;
  postal: string;
  phone: string;
  cpf?: string;
  
}

export interface CheckoutFormData {
  paymentMethodId: string;
  planType: string;
  isAnnual: boolean;
  customerInfo: CustomerInfo;
  userId: string;
  isDesconto?: boolean;
}
