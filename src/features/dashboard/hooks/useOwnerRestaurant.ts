import { getOwnerRestaurants } from "@/features/restaurant/services/restaurantServices"
import { QUERY_KEY } from "@/utils/queryKeys"
import { useQuery } from "@tanstack/react-query"

export const useOwnerRestaurant = () => {
    return useQuery({
        queryKey: [QUERY_KEY.OWNER_RESTAURANT],
        queryFn: getOwnerRestaurants,
    })
}