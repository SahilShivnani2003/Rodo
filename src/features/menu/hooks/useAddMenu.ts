import { useMutation } from "@tanstack/react-query"
import { createMenu } from "../services/menuServices"

export const useAddMenu = () => {
    return useMutation({
        mutationFn: createMenu,
    })
}