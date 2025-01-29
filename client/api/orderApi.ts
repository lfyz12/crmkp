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

    async getOrders(clientId: number): AxiosResponse {
        try {
            const response = await $host.get(`/orders/${clientId}`);
            return response;
        } catch (error) {
            handleError(error as AxiosError);
        }
    },

    async deleteOrders(id: number): AxiosResponse {
        try {
            const response = await $host.delete(`/orders/${id}`);
            return response.data;
        } catch (error) {
            handleError(error as AxiosError);
        }
    }
}