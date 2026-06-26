export interface LevelData {
  level: number;
  output: number;
  duration: string;
  duration_sec: number;
  input1: string;
  input1_amt: number;
  input2: string;
  input2_amt: number;
  yield: number;
  power_cost: number;
  xp_per_output: number;
  cost_symbol: string;
  cost_amount: number;
  production_per_day: number;
  xp_per_day: number;
  event: string;
}

export type FactoryCategory = 'basic' | 'crafted' | 'keys';

export interface FactoryData {
  [factoryName: string]: LevelData[];
}
