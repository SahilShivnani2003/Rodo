import { toggleRetaurantStatus } from "@/features/restaurant/services/restaurantServices"
import { useMutation } from "@tanstack/react-query"

export const useUpdateStatus = () => {
    return useMutation({
        mutationFn: toggleRetaurantStatus,
    })
}