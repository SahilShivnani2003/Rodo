import { useMutation } from "@tanstack/react-query"
import { validateOtp } from "../services/LoginService"
import { alert } from "@/utils/globalAlert"

export const useValidateOtp = () => {
    return useMutation({
        mutationFn: validateOtp,
        onSuccess: (data) => {
            alert.success(data?.message || 'OTP verfied successfully.')
        },
        onError: (error) => {
            alert.error(error.message || 'Failed to varify OTP.')
        }
    })
}