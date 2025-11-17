import { BaseRepository } from "../abstract/BaseRepository";
import { Scenario } from "../interfaces/scenario";
import scenarioSchema from "../models/scenarioSchema";
import mongoose from "mongoose";

export class ScenarioRepository extends BaseRepository<Scenario> {
    constructor() {
        super(scenarioSchema);
    }

    // 取得第一關場景
    public async getFirstScenario(): Promise<Scenario | null> {
        return await this.model.findOne({ level: 1 });
    }

    // 透過 ID 取得下一關場景
    public async getNextScenarioById(nextScenarioId: string): Promise<Scenario | null> {
        if (!mongoose.Types.ObjectId.isValid(nextScenarioId)) {
            throw new Error(`無效的場景 ID 格式: ${nextScenarioId}`);
        }        
        const scenario = await this.model.findById(new mongoose.Types.ObjectId(nextScenarioId));
        return scenario;
    }
}
