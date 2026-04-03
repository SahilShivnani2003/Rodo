import { AlertButton, AlertType } from '@/types/Alert';
import { createContext } from 'react';

export interface AlertOptions {
    type?: AlertType;
    title: string;
    message?: string;
    buttons?: AlertButton[];
    dismissable?: boolean;
}

export interface AlertContextValue {
    show: (options: AlertOptions) => void;
    success: (title: string, message?: string, buttons?: AlertButton[]) => void;
    error: (title: string, message?: string, buttons?: AlertButton[]) => void;
    warning: (title: string, message?: string, buttons?: AlertButton[]) => void;
    info: (title: string, message?: string, buttons?: AlertButton[]) => void;
    confirm: (title: string, message?: string) => Promise<boolean>;
    dismiss: () => void;
}

const AlertContext = createContext<AlertContextValue | null>(null);

export default AlertContext;