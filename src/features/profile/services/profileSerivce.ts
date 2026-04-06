import { privateClient } from "@/services/apiClient";
import { User } from "@/types/User";

//Get user/vendor profile
export const getProfile = async () => {
    try {

        console.log('FETCHIN USER PROFILE');

        const response = await privateClient.get('/auth/profile');

        console.log('GET PROFILE RESPONSE : ', response.data);

        return response.data;
    } catch (error) {
        console.error('GET PROFILE ERROR : ', error)

        throw error;
    }
};

//Update user/vendor profile
export const updateProfile = async (data: User) => {
    try {

        console.log('UPDATE USER PROFILE');

        const response = await privateClient.put('/auth/profile');

        console.log('UPDATE PROFILE RESPONSE : ', response.data);

        return response.data;

    } catch (error) {
        console.error('UPDATE PROFILE ERROR : ', error);

        throw error;
    }
}