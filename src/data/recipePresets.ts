// Famous pour-over recipe presets with detailed step-by-step instructions

export interface RecipeStep {
  label: string;
  duration: number;        // seconds
  waterTarget: number | null;  // cumulative grams (null for rest/drawdown)
  instructions: string;    // detailed instruction paragraph
  type: 'pour' | 'rest';   // for audio/haptic triggers
}

export interface RecipePreset {
  name: string;
  description: string;
  coffeeAmount: number;
  ratio: number;
  bloomRatio: number;
  grindSize: number;
  isRecipeMode: true;      // flag to enable two-column layout
  steps: RecipeStep[];
}

export const recipePresets: Record<string, RecipePreset> = {
  hoffmann: {
    name: "James Hoffmann's V60",
    description: 'A gentle, multi-pour approach that prioritizes even extraction and consistency.',
    coffeeAmount: 15,
    ratio: 16.7,
    bloomRatio: 2,
    grindSize: 6,
    isRecipeMode: true,
    steps: [
      {
        label: 'Bloom',
        duration: 45,
        waterTarget: 30,
        type: 'pour',
        instructions: 'Pour 30g water in gentle circles to wet all grounds. Wait 45 seconds.'
      },
      {
        label: 'First Pour',
        duration: 30,
        waterTarget: 150,
        type: 'pour',
        instructions: 'Pour slowly in circles until your scale reads 150g total. Maintain steady flow.'
      },
      {
        label: 'Second Pour',
        duration: 30,
        waterTarget: 250,
        type: 'pour',
        instructions: 'Keep pouring in circles until scale reads 250g total. Stay gentle and consistent.'
      },
      {
        label: 'Drawdown',
        duration: 45,
        waterTarget: null,
        type: 'rest',
        instructions: 'Let coffee drain completely without touching it. Should finish around 2:30-3:00.'
      }
    ]
  },

  foursix: {
    name: "Tetsu Kasuya's 4:6",
    description: 'A precise, five-pour technique that lets you dial in sweetness and strength independently.',
    coffeeAmount: 20,
    ratio: 15,
    bloomRatio: 2,
    grindSize: 6,
    isRecipeMode: true,
    steps: [
      {
        label: 'First Pour',
        duration: 45,
        waterTarget: 60,
        type: 'pour',
        instructions: 'Pour 60g water in the center. Wait 45 seconds.'
      },
      {
        label: 'Second Pour',
        duration: 45,
        waterTarget: 120,
        type: 'pour',
        instructions: 'Pour 60g more (120g total on scale). Wait 45 seconds.'
      },
      {
        label: 'Third Pour',
        duration: 45,
        waterTarget: 180,
        type: 'pour',
        instructions: 'Pour 60g more (180g total). Wait 45 seconds.'
      },
      {
        label: 'Fourth Pour',
        duration: 45,
        waterTarget: 240,
        type: 'pour',
        instructions: 'Pour 60g more (240g total). Wait 45 seconds.'
      },
      {
        label: 'Fifth Pour',
        duration: 45,
        waterTarget: 300,
        type: 'pour',
        instructions: 'Pour final 60g (300g total). Wait 45 seconds.'
      },
      {
        label: 'Drawdown',
        duration: 45,
        waterTarget: null,
        type: 'rest',
        instructions: 'Let coffee drain completely. Should finish around 3:30-4:00.'
      }
    ]
  },

  rao: {
    name: "Scott Rao's V60",
    description: 'A simplified single-pour technique focused on clarity and bringing out delicate flavors.',
    coffeeAmount: 22,
    ratio: 16.7,
    bloomRatio: 3,
    grindSize: 6,
    isRecipeMode: true,
    steps: [
      {
        label: 'Bloom',
        duration: 45,
        waterTarget: 66,
        type: 'pour',
        instructions: 'Pour 66g water directly in the center. Avoid stirring. Wait 45 seconds.'
      },
      {
        label: 'Main Pour',
        duration: 45,
        waterTarget: 367,
        type: 'pour',
        instructions: 'Pour remaining 301g in one steady stream in the center only. No circles. Finish by 1:30.'
      },
      {
        label: 'Drawdown',
        duration: 60,
        waterTarget: null,
        type: 'rest',
        instructions: 'Let coffee drain completely. Should finish around 2:30-3:30.'
      }
    ]
  }
};

