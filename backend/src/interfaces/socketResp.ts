export interface SocketResp<T> {
    success: boolean;
    message?: string;
    body?: T;
}