import { useAuthStore } from '@/store/useAuthStore';
import { ApiError } from '@/types/ApiError';
import axios from 'axios';

const BASE_URL = 'https://rodofood.onrender.com/api/v1';

//Public client for public routes
export const publicClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000
});

//Error handling for the public client
publicClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const apiError: ApiError = {
            status: error?.response?.status,
            message: error?.response?.data?.message || error?.message || "Something went wrong",
            data: error?.response?.data
        }

        return Promise.reject(apiError);
    },
);

//Private client for protected routes
export const privateClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000
})

//Dynamically adding token in private client
privateClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config;
    },
    (error) => Promise.reject(error)
);

//Error handling for private client
privateClient.interceptors.response.use(
    (response) => response,
    (error) => {

        const apiError: ApiError = {
            status: error?.response?.status,
            message: error?.response?.data?.message || error?.message || "Something went wrong",
            data: error?.response?.data
        }

        return Promise.reject(apiError);
    }
)