import mongoose from "mongoose";
import { Scenario } from "../interfaces/scenario";

const scenarioSchema = new mongoose.Schema({
    level: { type: Number, required: true, unique: true },              // 第N關
    title: { type: String, required: true },                            // 場景標題
    description: { type: String, required: true },                      // 場景描述
    duration: { type: Number, required: true },                         // 持續時間，單位為秒
    options: [{                                                         // 選項列表
        optionId: { type: String, required: true },                         // 選項ID
        text: { type: String, required: true },                             // 選項文字描述
        sceneAssetUrl: { type: String, required: true },                    // 選項場景資源URL
        consequence: { type: String, required: true },                      // 選項後果描述
        nextScenarioId: { type: String, ref: 'Scenario', default: null }    // 下一關 ID，null 代表遊戲結局
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<Scenario>("scenarios", scenarioSchema);
