import { getRestaurantsByRoutes } from "@/features/restaurant/services/restaurantServices"
import { QUERY_KEY } from "@/utils/queryKeys"
import { useQuery } from "@tanstack/react-query"

export const useRestaurants = (id: string) =>{
    return useQuery({
        queryKey: [QUERY_KEY.RESTAURANT],
        queryFn: () => getRestaurantsByRoutes({routeId: id}),
        enabled: !!id
    })
}