import { useMutation } from "@tanstack/react-query"
import { sendOtp } from "../services/LoginService"
import { alert } from "@/utils/globalAlert"
import { ApiError } from "@/types/ApiError"

export const useSendOtp = () => {
    return useMutation({
        mutationFn: sendOtp,
        onSuccess: (data) => {
            alert.success(data?.message || 'OTP sent successfully.')
        },
        onError: (error: ApiError) => {
            alert.error(error.message || 'Failed to sent OTP.')
        }
    })
}