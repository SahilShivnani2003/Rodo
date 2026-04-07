import { privateClient, publicClient } from "@/services/apiClient";
import { Restaurant } from "../types/Restaurant";

type params = {
    routeId: string;
    fromCity?: string;
    toCity?: string;
    userLat?: string;
    userLng?: string;
}

export const getRestaurantsByRoutes = async (params: params) => {
    try {

        console.log('FETCHING RESTAURANTS BY ROUTE ....');

        const response = await publicClient.get('/restaurants/by-route', { params });

        console.log('RESTAURANT BY ROUTE RESPONSE : ', response.data);

        return response.data;

    } catch (error) {
        console.error('ERROR WHILE FETCHING RESTAURANTS BY ROUTE : ', error);

        throw error;
    }
}

export const getOwnerRestaurants = async () => {
    try {
        console.log('Fetching owner restaurants ...');

        const res = await privateClient.get('/restaurants/owner/me');

        console.log('Owner restaurants response : ', res.data);

        return res.data;
    } catch (error) {
        console.error('Error while fetching owner restaurants : ', error);

        throw error;
    }
};

export const updateOwnerRestaurant = async (data: Restaurant) => {

    try {
        console.log('Updating owner restaurant : ', data);

        const res = await privateClient.put('/restaurants/owner/me', data);

        console.log('Restaurant update : ', res.data);

        return res.data;

    } catch (error) {
        console.error('Error while updating restaurant : ', error);

        throw error;
    }
};

export const toggleRetaurantStatus = async () => {
    try {

        console.log('Toggling the restaurant status ....');

        const res = await privateClient.patch('/restaurants/owner/toggle-status');

        console.log('Status updated of the restaurant : ', res.data);

        return res.data;
    } catch (error) {
        console.error('Error while updatig the status of the restaurant : ', error);

        throw error;
    }
}

export const createRestaurant = async (data: Restaurant) => {
    try {
        console.log('Creating restaurant ...');

        const res = await privateClient.post('/restaurants', data);

        console.log('Restaurant created : ', res.data);

        return res.data;
    } catch (error) {
        console.log('Error while creating restaurant : ', error);

        throw error;
    }
};

export const updateRestaurant = async (id: string, data: Restaurant) => {
    try {
        console.log('Updating Restaurant .....');

        const res = await privateClient.put(`/restaurants/${id}`, data);

        console.log('Restaurant updated : ', res.data);

        return res.data;
    } catch (error) {

        console.error('Error while updating restaurant : ', error);

        throw error;
    }
}

export const getRestaurantById = async (id: string) => {
    try {
        console.log('Fetching restaurant detail ....');

        const res = await privateClient.get(`/restaurants/${id}`);

        console.log('Restaurant details : ', res.data);

        return res.data;
    } catch (error) {
        console.error('Error while fetching restaurant details : ', error);

        throw error;
    }
}