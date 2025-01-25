import axios, { AxiosError } from 'axios';

const $host = axios.create({
    baseURL: 'http://localhost:5000/api'
});

export {$host}