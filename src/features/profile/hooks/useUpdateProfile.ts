import { useMutation } from "@tanstack/react-query"
import { updateProfile } from "../services/profileSerivce"
import { alert } from "@/utils/globalAlert"
import { ApiError } from "@/types/ApiError"

export const useUpdateProfile = () => {
    return useMutation({
        mutationFn: updateProfile,
        onSuccess: (data) => {
            alert.success(data?.message || 'Profile updated successfully');
        },
        onError: (error: ApiError) => {
            alert.error(error?.message || 'Something went wrong')
        }
    })
}