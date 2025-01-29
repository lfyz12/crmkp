export interface User {
    id: string;
    email: string;
    password?: string;
}

export interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
}

export interface Interaction {
    id: number;
    clientId: number;
    type: string;
    notes: string;
    date: Date;
}

export interface Order {
    id: number;
    clientId: number;
    orderDetails: any;
    totalAmount: number;
}

export interface Note {
    id: number;
    clientId: number;
    content: string;
}