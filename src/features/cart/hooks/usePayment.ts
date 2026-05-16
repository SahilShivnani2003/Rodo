import { useMutation } from "@tanstack/react-query"
import { initiatePayment, verifyPayment } from "../services/paymentService"

export const useInitiatePayment = () => {
    return useMutation({
        mutationFn: initiatePayment
    })
}

export const useVerifyPayment = () =>{
    return useMutation({
        mutationFn: verifyPayment
    })
}