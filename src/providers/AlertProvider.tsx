import { AlertContextValue, AlertOptions } from "@/context/AlertContext";
import { AlertButton } from "@/types/Alert";
import AlertContext from "@/context/AlertContext";
import CustomAlert from "@/components/common/CustomAlert";
import { useState, useRef, useCallback } from "react";

interface AlertState extends AlertOptions {
    visible: boolean;
}

const DEFAULT_STATE: AlertState = {
    visible: false,
    type: 'info',
    title: '',
    message: undefined,
    buttons: undefined,
    dismissable: true,
};

export function AlertProvider({ children }: { children: React.ReactNode }) {
    const [alertState, setAlertState] = useState<AlertState>(DEFAULT_STATE);

    // Holds the resolve function for `confirm()` promises
    const confirmResolve = useRef<((value: boolean) => void) | null>(null);

    const dismiss = useCallback(() => {
        setAlertState((prev) => ({ ...prev, visible: false }));
    }, []);

    const show = useCallback((options: AlertOptions) => {
        setAlertState({
            ...DEFAULT_STATE,
            ...options,
            visible: true,
        });
    }, []);

    const success = useCallback(
        (title: string, message?: string, buttons?: AlertButton[]) =>
            show({
                type: 'success',
                title,
                message,
                buttons: buttons ?? [{ label: 'Done', onPress: dismiss, style: 'primary' }],
            }),
        [show, dismiss],
    );

    const error = useCallback(
        (title: string, message?: string, buttons?: AlertButton[]) =>
            show({
                type: 'error',
                title,
                message,
                buttons: buttons ?? [{ label: 'OK', onPress: dismiss, style: 'primary' }],
            }),
        [show, dismiss],
    );

    const warning = useCallback(
        (title: string, message?: string, buttons?: AlertButton[]) =>
            show({
                type: 'warning',
                title,
                message,
                buttons: buttons ?? [{ label: 'OK', onPress: dismiss, style: 'primary' }],
            }),
        [show, dismiss],
    );

    const info = useCallback(
        (title: string, message?: string, buttons?: AlertButton[]) =>
            show({
                type: 'info',
                title,
                message,
                buttons: buttons ?? [{ label: 'Got it', onPress: dismiss, style: 'primary' }],
            }),
        [show, dismiss],
    );

    const confirm = useCallback(
        (title: string, message?: string): Promise<boolean> =>
            new Promise((resolve) => {
                confirmResolve.current = resolve;

                show({
                    type: 'confirm',
                    title,
                    message,
                    dismissable: false,
                    buttons: [
                        {
                            label: 'Cancel',
                            style: 'ghost',
                            onPress: () => {
                                dismiss();
                                confirmResolve.current?.(false);
                                confirmResolve.current = null;
                            },
                        },
                        {
                            label: 'Confirm',
                            style: 'primary',
                            onPress: () => {
                                dismiss();
                                confirmResolve.current?.(true);
                                confirmResolve.current = null;
                            },
                        },
                    ],
                });
            }),
        [show, dismiss],
    );

    const contextValue: AlertContextValue = {
        show,
        success,
        error,
        warning,
        info,
        confirm,
        dismiss,
    };

    return (
        <AlertContext.Provider value={contextValue}>
            {children}
            <CustomAlert
                visible={alertState.visible}
                type={alertState.type}
                title={alertState.title}
                message={alertState.message}
                buttons={alertState.buttons}
                dismissable={alertState.dismissable}
                onDismiss={dismiss}
            />
        </AlertContext.Provider>
    );
}