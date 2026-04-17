import { useMutation } from "@tanstack/react-query"
import { toggleMenuStatus } from "../services/menuServices"

export const useToggleMenuStatus = () => {
    return useMutation({
        mutationFn: toggleMenuStatus,
    })
}