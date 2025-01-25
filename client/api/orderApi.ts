import {Order} from "@/api/models";
import {$host} from "@/api/index";
import {handleError} from "@/api/error";
import {AxiosError, AxiosResponse} from "axios";

export const orderApi = {
    async createOrder(orderData: Omit<Order, 'id'>): AxiosResponse {
        try {
            const response = await $host.post('/orders', orderData);
            return response;
        } catch (error) {
            handleError(error as AxiosError);
        }
    },

    async getOrders(clientId: string): AxiosResponse {
        try {
            const response = await $host.get(`/orders/${clientId}`);
            return response;
        } catch (error) {
            handleError(error as AxiosError);
        }
    },
}