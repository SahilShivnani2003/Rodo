import { getRestaurantById } from "@/features/restaurant/services/restaurantServices"
import { QUERY_KEY } from "@/utils/queryKeys"
import { useQuery } from "@tanstack/react-query"

export const useGetResById = (id: string) =>{
    return useQuery({
        queryKey: [QUERY_KEY.RESTAURANT_DETAIL],
        queryFn: () => getRestaurantById(id),
        enabled: !!id
    })
}