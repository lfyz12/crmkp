import {Note} from "@/api/models";
import {$host} from "@/api/index";
import {handleError} from "@/api/error";
import {AxiosError, AxiosResponse} from "axios";

export const noteApi = {
    async createNote(noteData: Omit<Note, 'id'>): AxiosResponse {
        try {
            const response = await $host.post('/notes', noteData);
            return response;
        } catch (error) {
            handleError(error as AxiosError);
        }
    },

    async getNotes(clientId: string): AxiosResponse<Promise<Note[]>> {
        try {
            const response = await $host.get(`/notes/${clientId}`);
            return response;
        } catch (error) {
            handleError(error as AxiosError);
        }
    },
}