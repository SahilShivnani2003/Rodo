import { useMutation } from "@tanstack/react-query"
import { sendOtp } from "../services/LoginService"

export const useSendOtp = () => {
    return useMutation({
        mutationFn: sendOtp
    })
}