import {AxiosError} from "axios";

export const handleError = (error: AxiosError): never => {
    if (error.response) {
        console.error('Response Error:', error.response.data);
        throw new Error((error.response.data as { message: string }).message || 'Ошибка сервера');
    } else if (error.request) {
        console.error('Request Error:', error.request);
        throw new Error('Нет ответа от сервера');
    } else {
        console.error('Error:', error.message);
        throw new Error(error.message);
    }
};
