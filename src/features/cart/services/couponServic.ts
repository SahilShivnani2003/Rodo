import { privateClient } from "@/services/apiClient";

export const validateCoupon = async (data: {
    code: string,
    orderAmount: number,
    restaurantId: string,
}) => {
    try {

        console.log('Validating coupon with data:', data);

        const response = await privateClient.post('/coupons/validate', data);

        console.log('Coupon validation response:', response.data);

        return response.data;

    } catch (error) {    
        console.error('Error validating coupon:', error);
        throw error;
    }
}