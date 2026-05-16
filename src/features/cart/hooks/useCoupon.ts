import { useMutation } from "@tanstack/react-query"
import { validateCoupon } from "../services/couponServic"

export const useValidateCoupon = () => {
    return useMutation({
        mutationFn: validateCoupon
    })

}