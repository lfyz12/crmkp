import {Client} from "@/api/models";
import {$host} from "@/api/index";
import {handleError} from "@/api/error";
import {AxiosError, AxiosResponse} from "axios";

export const clientApi = {
    async createClient(clientData: Omit<Client, 'id'>): AxiosResponse<Promise<Client>> {
        try {
            const response = await $host.post<Client>('/clients', clientData);
            return response.data;
        } catch (error) {
            handleError(error as AxiosError);
        }
    },

    async getClients(): AxiosResponse {
        try {
            const response = await $host.get('/clients');
            return response;
        } catch (error) {
            handleError(error as AxiosError);
        }
    },

    async getClientById(id: string): AxiosResponse<Promise<Client>> {
        try {
            const response = await $host.get<Client>(`/clients/${id}`);
            return response.data;
        } catch (error) {
            handleError(error as AxiosError);
        }
    },

    async deleteClient(id: number): AxiosResponse {
        try {
            const response = await $host.delete(`/clients/${id}`);
            return response.data;
        } catch (error) {
            handleError(error as AxiosError);
        }
    },

    async updateClient(id: number, clientData: Partial<Client>): AxiosResponse {
        try {
            const response = await $host.put<Client>(`/clients/${id}`, clientData);
            return response.data;
        } catch (error) {
            handleError(error as AxiosError);
            throw error;
        }
    }
}