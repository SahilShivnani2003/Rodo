import { QUERY_KEY } from "@/utils/queryKeys"
import { useQuery } from "@tanstack/react-query"
import { getOwnerMenuList } from "../services/menuServices"

export const useGetOwnerResMenu = () => {
    return useQuery({
        queryKey: [QUERY_KEY.OWNER_MENU_LIST],
        queryFn: getOwnerMenuList,
    })
}