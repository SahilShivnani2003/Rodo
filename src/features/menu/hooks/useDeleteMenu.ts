import { useMutation } from "@tanstack/react-query"
import { deleteMenu } from "../services/menuServices"

export const useDeleteMenu = () =>{
    return useMutation({
        mutationFn: deleteMenu,
    })
}