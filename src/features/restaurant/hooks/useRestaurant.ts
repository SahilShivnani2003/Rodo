import { useMutation } from "@tanstack/react-query"
import { createRestaurant } from "../services/restaurantServices"

export const useCreateRestaurant = () => {
    return useMutation({
        mutationFn: createRestaurant,
    })
}