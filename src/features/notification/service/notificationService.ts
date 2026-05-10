import { privateClient } from "@/services/apiClient";

export const getMyNotification = async () => {
    try {
        console.log('Fetching my notifications ...');

        const response = await privateClient.get('/notifications/my');

        console.log('My token response  : ', response.data);

        return response.data;
    } catch (error) {
        console.error('Error while fetching my notifcation : ', error);
        throw error;
    }
}

export const notificationRead = async (id: string) => {
    try {
        console.log('Reading notifications....');

        const response = await privateClient.patch(`/notifications/${id}/read`);

        console.log('Read notification response : ', response.data);

        return response.data
    } catch (error) {
        console.error('Error while reading notification : ', error);
        throw error;
    }
}

export const notificationReadAll = async () => {
    try {
        console.log('Reading all notifcations....');

        const response = await privateClient.patch('/notifications/read-all');

        console.log('Reading all notifications response : ', response.data);

        return response.data
    } catch (error) {
        console.error('Error while reading all notifcations : ', error);
        throw error;
    }
}