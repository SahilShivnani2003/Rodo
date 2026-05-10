import { useMutation } from "@tanstack/react-query"
import { customerLogin, customerRegister, resendCustomerEmailOtp, verifyCustomerEmail } from "../services/LoginService"

export const useCustomerLogin = () =>{
    return useMutation({
        mutationFn: customerLogin
    })
}

export const useCustomerRegisteration = () =>{
    return useMutation({
        mutationFn: customerRegister,
    })
}

export const useVerifyCustomerEmail = () =>{
    return useMutation({
        mutationFn: verifyCustomerEmail,
    })
}

export const useResendCustomerOtp = () =>{
    return useMutation({
        mutationFn: resendCustomerEmailOtp,
    })
}