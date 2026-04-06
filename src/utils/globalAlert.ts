import { AlertContextValue } from "@/context/AlertContext";
import { success } from "zod";

let alertRef: AlertContextValue | null = null;

export const setAlert = (alert: AlertContextValue) => {
    alertRef = alert;
};

export const alert = {
    error: (message: string) => {
        alertRef?.error('Error', message);
    },

    success: (message: string) => {
        alertRef?.success('Success', message);
    },

    info: (message: string) => {
        alertRef?.info('Info', message);
    },

    warning: (message: string) => {
        alertRef?.warning('Warning', message);
    }
}