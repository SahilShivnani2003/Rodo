import { getRestaurantEarnings } from "@/features/orders/services/orderService"
import { QUERY_KEY } from "@/utils/queryKeys"
import { useQuery } from "@tanstack/react-query"

export const useRestaurantEarnings = () => {
    return useQuery({
        queryKey: [QUERY_KEY.RESTAURANT_EARNINGS],
        queryFn: getRestaurantEarnings,
    })
}