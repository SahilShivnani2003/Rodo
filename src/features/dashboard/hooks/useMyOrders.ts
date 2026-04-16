import { getMyOrders } from "@/features/orders/services/orderService"
import { QUERY_KEY } from "@/utils/queryKeys"
import { useQuery } from "@tanstack/react-query"

export const useMyOrders = () => {
    return useQuery({
        queryKey: [QUERY_KEY.MY_ORDERS],
        queryFn: getMyOrders,
    })
}