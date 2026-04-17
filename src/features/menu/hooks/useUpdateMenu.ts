import { useMutation } from "@tanstack/react-query"
import { updateMenu } from "../services/menuServices"

export const useUpdateMenu = () =>{
    return useMutation({
        mutationFn:updateMenu,
    })
}