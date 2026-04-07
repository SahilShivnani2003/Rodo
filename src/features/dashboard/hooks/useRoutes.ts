import { getAllRoutes } from "@/features/restaurant/services/routeService"
import { QUERY_KEY } from "@/utils/queryKeys"
import { useQuery } from "@tanstack/react-query"

export const useRoutes = () =>{
    return useQuery({
        queryKey:[QUERY_KEY.ROUTE],
        queryFn: getAllRoutes,
    })
}