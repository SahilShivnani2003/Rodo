import AlertContext, { AlertContextValue } from "@/context/AlertContext";
import { useContext } from "react";

export default function useAlert(): AlertContextValue {
    const context = useContext(AlertContext);

    if (!context) {
        throw new Error('useAlert must be used in a Alert Provider');
    };

    return context;
}