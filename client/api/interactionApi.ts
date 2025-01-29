import {Interaction} from "@/api/models";
import {$host} from "@/api/index";
import {handleError} from "@/api/error";
import {AxiosError, AxiosResponse} from "axios";

export const interactionApi = {

    async createInteraction(interactionData: Omit<Interaction, 'id'>): AxiosResponse {
        try {
            const response = await $host.post<Interaction>('/interactions', interactionData);
            return response;
        } catch (error) {
            handleError(error as AxiosError);
        }
    },

    async getInteractions():AxiosResponse {
        try {
            const response = await $host.get(`/interactions`);
            return response;
        } catch (error) {
            handleError(error as AxiosError);
        }
    },

    async deleteInteractions(id: number): AxiosResponse {
        try {
            const response = await $host.delete(`/interactions/${id}`);
            return response.data;
        } catch (error) {
            handleError(error as AxiosError);
        }
    }
}