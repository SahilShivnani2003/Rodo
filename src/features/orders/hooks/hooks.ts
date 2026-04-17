import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createOrder,
    getAllOrders,
    getMyOrders,
    getMyOrderDetail,
    getRestaurantEarnings,
    updateOrderStatus,
    UpdateOrderStatusData,
} from '../services/orderService';
import { Order, OrderStatus } from '../types/Order';

// ─── Query keys ───────────────────────────────────────────────────────────────

export const orderKeys = {
    all: ['orders'] as const,
    lists: () => [...orderKeys.all, 'list'] as const,
    list: (params: Record<string, string | undefined>) =>
        [...orderKeys.lists(), params] as const,
    myOrders: () => [...orderKeys.all, 'my'] as const,
    myDetail: (id: string) => [...orderKeys.all, 'my', id] as const,
    earnings: () => [...orderKeys.all, 'earnings'] as const,
};

// ─── Create order ─────────────────────────────────────────────────────────────

export const useCreateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Order) => createOrder(data),
        onSuccess: () => {
            // Invalidate my orders list so it refreshes on the orders screen
            queryClient.invalidateQueries({ queryKey: orderKeys.myOrders() });
        },
    });
};

// ─── Get all orders (admin / restaurant view) ─────────────────────────────────

export const useGetAllOrders = (params: {
    page?: string;
    limit?: string;
    status?: string;
    restaurantId?: string;
    userId?: string;
} = {}) => {
    return useQuery({
        queryKey: orderKeys.list(params),
        queryFn: () => getAllOrders(params),
    });
};

// ─── Get my orders ────────────────────────────────────────────────────────────

export const useGetMyOrders = () => {
    return useQuery({
        queryKey: orderKeys.myOrders(),
        queryFn: getMyOrders,
    });
};

// ─── Get single order detail ──────────────────────────────────────────────────

export const useGetMyOrderDetail = (id: string) => {
    return useQuery({
        queryKey: orderKeys.myDetail(id),
        queryFn: () => getMyOrderDetail(id),
        enabled: !!id, // don't fire if id is empty
    });
};

// ─── Restaurant earnings ──────────────────────────────────────────────────────

export const useGetRestaurantEarnings = () => {
    return useQuery({
        queryKey: orderKeys.earnings(),
        queryFn: getRestaurantEarnings,
    });
};

// ─── Update order status ──────────────────────────────────────────────────────

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateOrderStatusData }) =>
            updateOrderStatus(id, data),
        onSuccess: (_, { id }) => {
            // Invalidate both the list and the specific order
            queryClient.invalidateQueries({ queryKey: orderKeys.myOrders() });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            queryClient.invalidateQueries({ queryKey: orderKeys.myDetail(id) });
        },
    });
};