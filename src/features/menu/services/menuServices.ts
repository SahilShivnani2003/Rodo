import { privateClient, publicClient } from "@/services/apiClient";
import { MenuItem } from "../types/MenuItem";

export const getReaturantMenu = async (id: string) => {
    try {
        console.log('Fetch restaurant menu.... ');

        const res = await publicClient.get(`/menu/${id}`);

        console.log('Fetched menu : ', res.data);

        return res.data;
    } catch (error) {
        console.error('Error while fetching menu : ', error);
        throw error;
    }
};

export const getOwnerMenuList = async () => {
    try {
        console.log('Fetching owner menu list ....');
        const res = await privateClient.get('/menu/owner/all');

        console.log('Fetched owner menu list : ', res.data);

        return res.data;
    } catch (error) {
        console.error('Error while fetching menu list : ', error);

        throw error;
    }
};

export const createMenu = async (data: MenuItem) => {
    try {
        console.log('Creating menu item ');

        const res = await privateClient.post('/menu', data);

        console.log('Menu item created : ', res.data);

        return res.data;
    } catch (error) {
        console.error('Failed to create menu item ');

        throw error;
    }
}

export const updateMenu = async (id: string, data: MenuItem) => {
    try {
        console.log('Updating menu item ');

        const res = await privateClient.put(`/menu/${id}`, data);

        console.log('Menu item updatd : ', res.data);

        return res.data;
    } catch (error) {
        console.error('Failed to update menu item ');

        throw error;
    }
}

export const deleteMenu = async (id: string) => {
    try {
        console.log('Deleting menu item....');

        const res = await privateClient.delete(`/menu/${id}`);

        console.log('Menu item deleted : ', res.data);

        return res.data;
    } catch (error) {
        console.error('Error while deleting menu item : ', error);

        throw error;
    }
};

export const toggleMenuStatu = async (id: string) => {
    try {
        console.log('Toggling menu status ...');

        const res = await privateClient.patch(`/menu/${id}/toggle`);

        console.log('Menu status updated : ', res.data);

        return res.data;
    } catch (error) {
        console.error('Error while updating menu status : ', error);

        throw error;
        
    }
}