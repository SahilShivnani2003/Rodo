import { privateClient } from "@/services/apiClient";
import { Order, OrderStatus } from "../types/Order";

type params = {
    page?: string;
    limit?: string;
    status?: string;
    restaurantId?: string;
    userId?: string;
}
export const createOrder = async (data: Order) => {
    try {
        console.log('Creating order .....');

        const res = await privateClient.post('/orders', data);

        console.log('Order created successfully : ', res.data);

        return res.data;
    } catch (error) {
        console.error('Error while creating order : ', error);

        throw error;
    }
};

export const getAllOrders = async (params: params) => {
    try {
        console.log('Fetching orders.....');

        const res = await privateClient.get('/orders', { params });

        console.log('Fetched orders : ', res.data);

        return res.data;
    } catch (error) {
        console.error('Error while fetching the order : ', error);

        throw error;
    }
};

export const getMyOrders = async () => {
    try {
        console.log('Fetching may orders.....');

        const res = await privateClient.get('/orders/my');

        console.log('Fetched my orders : ', res.data);

        return res.data;
    } catch (error) {
        console.error('Error while fetching my order : ', error);

        throw error;
    }
}

export const getMyOrderDetail = async (id: string) => {
    try {
        console.log('Fetchin my order detail .....')

        const res = await privateClient.get(`/orders/my/${id}`);

        console.log('My order detail response : ', res.data);

        return res.data;
    } catch (error) {
        console.error('Error while fetching order details : ', error);

        throw error;
    }
}

export const getRestaurantEarnings = async()=>{
    try{
        console.log('Fetching restaurant earnings ....');
    
        const res = await privateClient.get('/orders/restaurant/earnings');

        console.log('Restaurant earnings : ', res.data);

        return res.data;
    }catch(error){
        console.error('Errow while fetching earnings : ', error);

        throw error;
    }
}

export const updateOrderStatus = async(id: string, data: {
    status: OrderStatus;
    rejectionReason: string;
}) =>{
    try{
        console.log('Updating order status.....');

        const res = await privateClient.patch(`/orders/restaurant/${id}/status`, data);

        console.log('Order status updated : ', res.data);

        return res.data;
    }catch(error){
        console.error('Error while updating order status : ', error);

        throw error;
    }
}

export const getRestaurantOrder = async () => {
    try{
        console.log('Fetching restaurant orders.....');
        const res = await privateClient.get('/orders/restaurant');

        console.log('Fetched restaurant orders : ', res.data);
        return res.data;

    }catch(error){
        console.error('Error while fetching restaurant orders : ', error);

        throw error;
    }
}