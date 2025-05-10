export type BrewingPhase = 'bloom' | 'firstPour' | 'rest' | 'secondPour' | 'secondRest' | 'thirdPour' | 'drawdown';

export interface CoffeeSettings {
  amount: number;  // in grams
  ratio: number;   // water to coffee ratio
}