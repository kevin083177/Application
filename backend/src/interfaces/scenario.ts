import { Document } from 'mongoose';

export interface Scenario extends Document {
    _id: string;
    level: number;
    title: string;
    description: string;
    duration: number; // 單位為秒
    options: {
        optionId: string;
        text: string;
        sceneAssetUrl: string;
        consequence: string;
        resultAnimationUrl: string;
        resultAnimationDuration: number; // 單位為毫秒
        nextScenarioId: string | null; // null 代表遊戲結局
    }[];
    createdAt?: Date;
    updatedAt?: Date;
}