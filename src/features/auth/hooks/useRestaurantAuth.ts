import { useMutation } from "@tanstack/react-query"
import { resentRestaurantEmailOtp, restaurantLogin, restaurantRegister, verifyRestaurantEmail } from "../services/LoginService"

export const useRestaurantLogin = () => {
    return useMutation({
        mutationFn: restaurantLogin
    })
}

export const useRestaurantRegisteration = () => {
    return useMutation({
        mutationFn: restaurantRegister,
    })
}

export const useVerifyRestaurantEmail = () => {
    return useMutation({
        mutationFn: verifyRestaurantEmail
    })
}

export const useResendRestaurantOtp = () => {
    return useMutation({
        mutationFn: resentRestaurantEmailOtp
    })
}