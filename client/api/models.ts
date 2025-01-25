export interface User {
    id: string;
    email: string;
    password?: string;
}

export interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
}

export interface Interaction {
    id: string;
    clientId: string;
    type: string;
    notes: string;
    date: Date;
}

export interface Order {
    id: string;
    clientId: string;
    orderDetails: any;
    totalAmount: number;
}

export interface Note {
    id: string;
    clientId: string;
    content: string;
}