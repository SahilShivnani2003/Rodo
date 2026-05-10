import { publicClient } from "@/services/apiClient";

export const getAllRoutes = async () => {
    try {

        console.log('FETCHIN ALL ROUTES');

        const response = await publicClient.get('/routes');

        console.log('GET ALL ROUTES RESPONSE : ', response.data);

        return response.data;

    } catch (error) {
        console.error('GET ALL ROUTE ERROR : ', error);

        throw error;
    }
};

export const getRouteById = async (id: string) => {
    try {
        console.log('Fetching route by id....');

        const response = await publicClient.get(`/routes/${id}`);

        console.log('Routes by id response : ', response.data);

        return response.data;
    } catch (error) {
        console.error('Error while fetching routes by id : ', error);
        throw error;
    }
}