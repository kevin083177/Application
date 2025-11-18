import { connect, Mongoose } from 'mongoose';
import { logger } from '../middlewares/log';
import { Mongo } from '../interfaces/mongo';

export class MongoDB {
    private url: string;
    DB: Mongoose | void | undefined
    isConnected: boolean = false

    constructor(mongo: Mongo) {
        this.url  = `mongodb+srv://${mongo.name}:${mongo.password}@${mongo.host}/${mongo.dbName}`;
    }

    async connect() {
        if (this.isConnected) {
            return;
        }
        
        try {
            this.DB = await connect(this.url);
            logger.info(`success: connect to MongoDB @${this.url}`);
            this.isConnected = true;
        } catch (err) {
            logger.error(`error: failed to connect to MongoDB @${this.url}`, err);
            process.exit(1); 
        }
    }

    getState(): boolean {
        return this.isConnected;
    }
}