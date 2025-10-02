export type BrewingPhase = 'bloom' | 'firstPour' | 'rest' | 'secondPour' | 'secondRest' | 'thirdPour' | 'drawdown';

export type GrindSize = 'Fine' | 'Medium' | 'Coarse';

export interface CoffeeSettings {
  amount: number;  // in grams
  ratio: number;   // water to coffee ratio
  bloomRatio: number; // 2x or 3x coffee weight
}

export interface RecipeStep {
  label: string;
  duration: number;
  waterTarget: number | null;
  instructions: string;
  type: 'pour' | 'rest';
}

export interface RecipePreset {
  name: string;
  description: string;
  coffeeAmount: number;
  ratio: number;
  bloomRatio: number;
  grindSize: number;
  isRecipeMode: true;
  steps: RecipeStep[];
}

export interface StandardPreset {
  name: string;
  description: string;
  coffeeAmount: number;
  ratio: number;
  bloomRatio: number;
  grindSize: number;
}