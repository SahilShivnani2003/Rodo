import { publicClient } from "@/services/apiClient"

export const sendOtp = async (data: { phone: string }) => {
    try {

        console.log('SENDING OTP .....')
        const response = await publicClient.post('/auth/send-otp', data);

        console.log('SEND OTP RESPONSE : ', response.data);

        return response.data;

    } catch (error) {
        console.error('SEND OTP ERROR : ', error);

        throw error;
    }
};

export const validateOtp = async (data: { phone: string, otp: string }) => {
    try {

        console.log('VALIDATING OTP .....');

        const response = await publicClient.post('/auth/verify-otp', data);

        console.log('VALIDATE OTP RESPONSE : ', response.data);

        return response.data;

    } catch (error) {
        console.error('VALIDATE OTP ERROR : ', error);

        throw error;
    }
}