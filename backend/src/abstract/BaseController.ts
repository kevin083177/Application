import { Request, Response } from "express";
import { Document } from "mongoose";
import { BaseService } from "./BaseService";
import { NextFunction } from "express";
import { logger } from "../middlewares/log";
import { resp } from "../interfaces/resp";

export abstract class BaseController<T extends Document> {
    protected abstract service: BaseService<T>;

    // error handling for async controller methods
    protected asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
        return (req: Request, res: Response, next: NextFunction) => {
            Promise.resolve(fn(req, res, next)).catch((error) => {
                logger.error(`Controller error:`, error);
                this.internalError(res, null, error.message);
            });
        };
    }

    // standardized response sender
    protected sendResponse<U>(res: Response, status: number, message: string, body?: U) {
        const response: resp<U> = {
            status,
            message,
            body: body as U
        };
        return res.status(status).json(response);
    }

    // http code 200
    protected ok<U>(res: Response, data?: U, message?: string) {
        return this.sendResponse(res, 200, message || 'Request successful', data);
    }

    // http code 201
    protected created<U>(res: Response, data?: U, message?: string) {
        return this.sendResponse(res, 201, message || 'Resource created', data);
    }

    // http code 400
    protected badRequest<U>(res: Response, data?: U, message?: string) {
        return this.sendResponse(res, 400, message || 'Bad request', data);
    }

    // http code 401
    protected unauthorized<U>(res: Response, data?: U, message?: string) {
        return this.sendResponse(res, 401, message || 'Unauthorized', data);
    }

    // http code 403
    protected forbidden<U>(res: Response, data?: U, message?: string) {
        return this.sendResponse(res, 403, message || 'Forbidden', data);
    }

    // http code 404
    protected notFound<U>(res: Response, data?: U, message?: string) {
        return this.sendResponse(res, 404, message || 'Not found', data);
    }

    // http code 500
    protected internalError<U>(res: Response, data?: U, message?: string) {
        return this.sendResponse(res, 500, message || 'Internal server error', data);
    }
}