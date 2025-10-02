export type BrewingPhase = 'bloom' | 'firstPour' | 'rest' | 'secondPour' | 'secondRest' | 'thirdPour' | 'drawdown';

export type GrindSize = 'Fine' | 'Medium' | 'Coarse';

export interface CoffeeSettings {
  amount: number;  // in grams
  ratio: number;   // water to coffee ratio
  bloomRatio: number; // 2x or 3x coffee weight
}