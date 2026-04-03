import { User } from "@/types/User";
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthState = {
    isAuthenticated: boolean;
    token: string | null;
    user: User | null;
    setAuth: (user: User, token: string) => void;
    removeAuth: () => void;
    loadAuth: () => void;
}

const STORAGE_KEY = 'auth';

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    token: null,
    user: null,
    setAuth: async (user: User, token: string) => {
        try {

            if (!user || !token) {
                console.error('USER AND TOKEN MISSING ');
                return;
            }
            const data = JSON.stringify({ user, token });

            await AsyncStorage.setItem(STORAGE_KEY, data);

            set({
                isAuthenticated: true,
                user: user,
                token: token
            })
        } catch (error: any) {
            console.error('ERROR SAVING AUTH : ', error);
        }
    },
    removeAuth: async () => {
        try {

            await AsyncStorage.removeItem(STORAGE_KEY);

            set({
                isAuthenticated: false,
                user: null,
                token: null
            })

        } catch (error: any) {
            console.error('ERROR RMOVING AUTH : ', error);
        }
    },
    loadAuth: async () => {
        try {

            const data = await AsyncStorage.getItem(STORAGE_KEY);

            if (data) {
                const auth = JSON.parse(data);

                set({
                    isAuthenticated: true,
                    user: auth?.user,
                    token: auth?.token
                })
            } else {
                console.warn('NO AUTH FOUND');

                set({
                    isAuthenticated: false,
                    user: null,
                    token: null
                })
            }
        } catch (error) {
            console.error('ERROR LOADING AUTH : ', error);
        }
    }
}))