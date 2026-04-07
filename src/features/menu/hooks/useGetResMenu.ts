import { QUERY_KEY } from "@/utils/queryKeys"
import { useQuery } from "@tanstack/react-query"
import { getReaturantMenu } from "../services/menuServices"

export const useGetResMenu = (id:string)=>{
    return useQuery({
        queryKey: [QUERY_KEY.MENU, id],
        queryFn: ()=> getReaturantMenu(id),
        enabled: !!id
    })
}