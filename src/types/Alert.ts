export type AlertType = 'success' | 'error' | 'warning' | 'confirm' | 'info';

export type styleType = 'primary' | 'secondary' | 'danger' | 'ghost';

export type AlertButton = {
    label: string;
    onPress: () => void;
    style?: styleType;
}

export type CustomAlertProps = {
    visible: boolean;
    type?: AlertType;
    title: string;
    message?: string;
    buttons?: AlertButton[];
    onDismiss?: () => void;
    dismissable?: boolean;
}

export type IconStyle = {
    icon: string;
    iconColor: string;
    iconBg: string;
    accentColor: string;
}

