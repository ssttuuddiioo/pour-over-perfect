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
    name: 'Hoffmann Method',
    description: 'Simple and forgiving technique by James Hoffmann',
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
        instructions: 'Pour 30g water (2× coffee weight) in center using a gentle circular motion to wet all grounds evenly. Wait for 45 seconds while the coffee blooms and releases CO2.'
      },
      {
        label: 'First Pour',
        duration: 30,
        waterTarget: 150,
        type: 'pour',
        instructions: 'Pour in slow concentric circles from center outward until you reach 150g total on the scale (60% of total water). Try to complete this pour by 1:15 on the timer. Maintain a steady, gentle flow.'
      },
      {
        label: 'Continue Pouring',
        duration: 30,
        waterTarget: 250,
        type: 'pour',
        instructions: 'Continue pouring gently in concentric circles until you reach 250g total on the scale (100% of water). Aim to complete this by 1:45. Keep the water level consistent throughout the pour.'
      },
      {
        label: 'Drawdown',
        duration: 45,
        waterTarget: null,
        type: 'rest',
        instructions: 'Let the coffee drain completely. Avoid disturbing the brew bed. The coffee should finish draining by 2:30-3:00. If it drains too fast, grind finer next time. If too slow, grind coarser.'
      }
    ]
  },

  foursix: {
    name: '4:6 Method',
    description: 'Tetsu Kasuya\'s World Brewers Cup winning technique',
    coffeeAmount: 20,
    ratio: 15,
    bloomRatio: 2,
    grindSize: 6,
    isRecipeMode: true,
    steps: [
      {
        label: 'First Pour - 40%',
        duration: 45,
        waterTarget: 60,
        type: 'pour',
        instructions: 'Pour 60g water in the center of the coffee bed. This first pour (along with the second) controls the sweetness and acidity of your brew. Wait 45 seconds before the next pour.'
      },
      {
        label: 'Second Pour - 40%',
        duration: 45,
        waterTarget: 120,
        type: 'pour',
        instructions: 'Pour another 60g water (120g total on scale) in the center. The first two pours together represent 40% of total water and control flavor balance. Wait 45 seconds.'
      },
      {
        label: 'Third Pour - 60%',
        duration: 45,
        waterTarget: 180,
        type: 'pour',
        instructions: 'Pour 60g water (180g total) in the center. This pour begins the second phase (60% of water) which controls the strength of the brew. Wait 45 seconds.'
      },
      {
        label: 'Fourth Pour - 60%',
        duration: 45,
        waterTarget: 240,
        type: 'pour',
        instructions: 'Pour 60g water (240g total) in the center. Continue controlling brew strength with this pour. Wait 45 seconds before the final pour.'
      },
      {
        label: 'Fifth Pour - 60%',
        duration: 45,
        waterTarget: 300,
        type: 'pour',
        instructions: 'Pour the final 60g water (300g total) in the center. This completes the 60% phase. Wait 45 seconds for drawdown to begin.'
      },
      {
        label: 'Drawdown',
        duration: 45,
        waterTarget: null,
        type: 'rest',
        instructions: 'Let the coffee drain completely. Total brew time should be around 3:30-4:00. The method\'s precision allows you to adjust sweetness (first 40%) and strength (last 60%) independently in future brews.'
      }
    ]
  },

  rao: {
    name: 'Rao Method',
    description: 'Scott Rao\'s center-pour technique for clarity',
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
        instructions: 'Pour 66g water (3× coffee weight) directly in the center of the coffee bed. Avoid agitating the grounds too much. Let bloom for 30-45 seconds while gases release.'
      },
      {
        label: 'Main Pour',
        duration: 45,
        waterTarget: 367,
        type: 'pour',
        instructions: 'Pour the remaining 301g water in one continuous, steady stream directly in the center. Do NOT use circular motions—keep the pour focused on the center. Aim to finish pouring by 1:30 on the timer. The single pour technique maximizes clarity and highlights delicate flavors.'
      },
      {
        label: 'Drawdown',
        duration: 60,
        waterTarget: null,
        type: 'rest',
        instructions: 'Let the coffee drain completely without disturbing the brew bed. Total brew time should be 2:30-3:30. The center-pour technique creates a focused extraction that emphasizes clarity and sweetness in light roasts.'
      }
    ]
  }
};

