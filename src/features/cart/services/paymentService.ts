import { OrderItem } from "@/features/orders/types/Order";
import { privateClient } from "@/services/apiClient";

export const initiatePayment = async (data: {
    restaurantId: string;
    items: OrderItem[];
    orderType: string;
    customerETA: string;
    etaMinutes?: number;
    couponCode?: string;
}) => {
    try {
        console.log('Initiating payment with data:', data);

        const response = await privateClient.post('/payments/initiate', data);

        console.log('Payment initiation response:', response.data);

        return response.data;
    } catch (error) {
        console.error('Error initiating payment:', error);
        throw error;
    }
}

export const verifyPayment = async (data: {
    razorpay_payment_id: string;
    snapshot: any;
}) => {
    try {
        console.log('Verifying payment with data:', data);
        const response = await privateClient.post('/payments/verify', data);

        console.log('Payment verification response:', response.data);

        return response.data;

    } catch (error) {
        console.error('Error verifying payment:', error);
        throw error;
    }
}