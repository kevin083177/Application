import { Router } from 'express';
import { BaseController } from './BaseController';
import { MyRoute } from '../interfaces/Route';
import { Document } from 'mongoose';

export abstract class BaseRoute<T extends Document> implements MyRoute {
    public path: string;
    public router: Router;
    protected controller: BaseController<T>;

    constructor(path: string, controller: BaseController<T>) {
        this.path = path;
        this.controller = controller;
        this.router = Router();
        this.setRoutes();
    }

    protected abstract setRoutes(): void;

    protected get(subPath: string, handler: any): void {
        this.router.get(subPath, handler);
    }

    protected post(subPath: string, handler: any): void {
        this.router.post(subPath, handler);
    }

    protected put(subPath: string, handler: any): void {
        this.router.put(subPath, handler);
    }

    protected delete(subPath: string, handler: any): void {
        this.router.delete(subPath, handler);
    }

    protected patch(subPath: string, handler: any): void {
        this.router.patch(subPath, handler);
    }

}