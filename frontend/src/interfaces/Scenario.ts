export interface Scenario {
  _id: string;
  title: string;
  description: string;
  duration: number; // seconds
  options: ScenarioOption[];
}

export interface ScenarioOption {
  optionId: string;
  text: string;
  consequence: string;
  nextScenarioId: string | null;
}