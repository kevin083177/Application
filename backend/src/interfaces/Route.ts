import { Router } from 'express';

export interface MyRoute {
    path: string;
    router: Router;
}