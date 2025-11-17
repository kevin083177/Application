import { BaseService } from "../abstract/BaseService";
import { Scenario } from "../interfaces/scenario";
import { ScenarioRepository } from "../repository/scenarioRepository";

export class ScenarioService extends BaseService<Scenario> {
    protected repository: ScenarioRepository;

    constructor() {
        const repository = new ScenarioRepository();
        super(repository);
        this.repository = repository;
    }

    // 取得第一關場景
    public async getFirstScenario(): Promise<Scenario | null> {
        const scenario = await this.repository.getFirstScenario();
        if (!scenario) {
            return null;
        }
        return scenario;
    }

    // 透過 ID 取得下一關場景
    public async getNextScenarioById(nextScenarioId: string): Promise<Scenario | null> {
        if (!nextScenarioId) {
            return null;
        }
        const scenario: Scenario | null = await this.repository.getNextScenarioById(nextScenarioId);
        if (!scenario) {
            return null;
        }
        console.log("Retrieved scenario:", scenario);
        return scenario;
    }
}
