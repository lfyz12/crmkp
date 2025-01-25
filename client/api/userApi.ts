import {User} from "@/api/models";
import {$host} from "@/api/index";
import {handleError} from "@/api/error";
import {AxiosError, AxiosResponse} from "axios";

export const userApi = {
    async register(userData: Omit<User, 'id'>): AxiosResponse<Promise<User>> {
        try {
            const response = await $host.post('/users/register', userData);
            return response.data;
        } catch (error) {
            handleError(error as AxiosError);
        }
    },

    async login(userData: Omit<User, 'id'>): AxiosResponse<Promise<User>> {
        try {
            const response = await $host.post('/users/login', userData);
            return response.data;
        } catch (error) {
            handleError(error as AxiosError);
        }
    },
}