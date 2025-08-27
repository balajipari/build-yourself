import { API_CONFIG } from '../config/api';
import type { RazorpayOptions, RazorpayResponse } from '../types/razorpay';
import toast from 'react-hot-toast';

// Types are defined in types/razorpay.d.ts

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  rate_to_usd: number;
  is_active: boolean;
}

interface CreditPackage {
  id: string;
  credits: number;
  base_price_usd: number;
  is_active: boolean;
}

interface PackagePrice {
  currency_code: string;
  currency_symbol: string;
  amount: number;
  credits: number;
}

class PaymentService {
  async getCurrencies(): Promise<Currency[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/payments/currencies`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch currencies');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching currencies:', error);
      throw error;
    }
  }

  async getCreditPackages(): Promise<CreditPackage[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/payments/packages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch credit packages');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching credit packages:', error);
      throw error;
    }
  }

  async getPackagePrice(packageId: string, currencyCode: string): Promise<PackagePrice> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/payments/packages/${packageId}/price/${currencyCode}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch package price');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching package price:', error);
      throw error;
    }
  }

  async createOrder(packageId: string, currencyCode: string) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: JSON.stringify({
          package_id: packageId,
          currency_code: currencyCode
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: JSON.stringify({
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: signature
        })
      });

      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  async initializePayment(userEmail: string, userName: string, packageId: string, currencyCode: string) {
    try {
      // Create order on backend
      const orderData = await this.createOrder(packageId, currencyCode);

      // Initialize Razorpay
      const options: RazorpayOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Build Yourself',
        description: 'Project Credits Recharge',
        order_id: orderData.id,
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment
            await this.verifyPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            );

            // Show success message
            toast.success('Payment successful! Your credits have been added.');
            
            // Refresh the page to update quota
            window.location.reload();
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: '#8c52ff'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment initialization failed:', error);
      alert('Failed to initialize payment. Please try again.');
    }
  }
}

export const paymentService = new PaymentService();
