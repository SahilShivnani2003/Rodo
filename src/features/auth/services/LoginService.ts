import { publicClient } from "@/services/apiClient"
import { Register } from "../types/Register";

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

//Customer auth 
export const customerLogin = async (data: { phone: string, password: string }) => {
    try {
        console.log('Customer login...');

        const response = await publicClient.post('/customer/login', data);

        console.log('Customer login response : ', response.data);

        return response.data;
    } catch (error) {
        console.error('Error while customer login : ', error);
        throw error;
    }
}

export const customerRegister = async (data: Register) => {
    try {
        console.log('Customer Registering....');

        const response = await publicClient.post('/customer/register', data);

        console.log('Customer register response : ', response.data);

        return response.data;
    } catch (error) {
        console.error('Error while registering customer : ', error);
        throw error;
    }
}

export const verifyCustomerEmail = async (data: { email: string, otp: string }) => {
    try {
        console.log('Customer email verifying.....');

        const response = await publicClient.post('/customer/verify-email', data);

        console.log('Customer email verifying response : ', response.data);

        return response.data;
    } catch (error) {
        console.error('Error while verfiying customer email :', error);
        throw error;
    }
}

export const resentCustomerEmailOtp = async (email: string) => {
    try {
        console.log('Resending customer email otp ....')

        const response = await publicClient.post('/customer/resend-otp', { email })

        console.log('Resend otp response : ', response.data);

        return response.data;
    } catch (error) {
        console.error('Error while re-sending email otp for customer : ', error);
        throw error;
    }
}


//Restaurant update auth
export const restaurantLogin = async (data: { phone: string, password: string }) => {
    try {
        console.log('Customer login...');

        const response = await publicClient.post('/restaurant/login', data);

        console.log('Customer login response : ', response.data);

        return response.data;
    } catch (error) {
        console.error('Error while customer login : ', error);
        throw error;
    }
}

export const restaurantRegister = async (data: Register) => {
    try {
        console.log('Customer Registering....');

        const response = await publicClient.post('/restaurant/register', data);

        console.log('Customer register response : ', response.data);

        return response.data;
    } catch (error) {
        console.error('Error while registering customer : ', error);
        throw error;
    }
}

export const verifyRestaurantEmail = async (data: { email: string, otp: string }) => {
    try {
        console.log('Customer email verifying.....');

        const response = await publicClient.post('/restaurant/verify-email', data);

        console.log('Customer email verifying response : ', response.data);

        return response.data;
    } catch (error) {
        console.error('Error while verfiying customer email :', error);
        throw error;
    }
}

export const resentRestaurantEmailOtp = async (email: string) => {
    try {
        console.log('Resending customer email otp ....')

        const response = await publicClient.post('/restaurant/resend-otp', { email })

        console.log('Resend otp response : ', response.data);

        return response.data;
    } catch (error) {
        console.error('Error while re-sending email otp for customer : ', error);
        throw error;
    }
}