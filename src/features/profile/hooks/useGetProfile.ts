import { useMutation } from "@tanstack/react-query"
import { getProfile } from "../services/profileSerivce"
import { QUERY_KEY } from "@/utils/queryKeys"

export const useGetProfile = () => {
    return useMutation({
        mutationKey: [QUERY_KEY.PROFILE],
        mutationFn: getProfile
    })
}