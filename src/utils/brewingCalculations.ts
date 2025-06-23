import { CoffeeSettings } from '../types/brewing';

export interface BrewingTimings {
  steps: {
    label: string;
    targetWater: number; // cumulative water target after the step
    duration: number; // seconds
  }[];
  totalWater: number;
  totalTime: number;
}

/**
 * Generate a four-phase pour-over recipe with bloom + three main pours.
 *
 * Phases:
 * 1. Bloom – 2× dose for 30s
 * 2. First Pour – 30% of remaining water + 10s rest
 * 3. Second Pour – 35% of remaining water + 10s rest  
 * 4. Third Pour – 35% of remaining water + drawdown
 */
export function generateBrewPlan({
  dose, // coffee in grams
  ratio, // water : coffee ratio (e.g. 18)
  grindSize = 6, // 1–10 where 6 ≈ medium
  bloomRatio = 2, // bloom water multiplier of dose
  pourRate = 5, // g / s
}: {
  dose: number;
  ratio: number;
  grindSize?: number;
  bloomRatio?: number;
  pourRate?: number;
}): BrewingTimings {
  // CONSTANTS
  const BLOOM_MULT = bloomRatio;
  const FRACTIONS = [0.30, 0.35, 0.35]; // three pours after bloom
  const POUR_RATE = pourRate;
  const T_BLOOM = 30; // s
  const T_REST = 10; // s after each main pour
  const DRAW_BASE = 45; // s for 250g water @ grind 6
  const GRIND_ADJ = 5; // s per step finer/coarser
  const VOL_ADJ = 5; // s per extra 50g above 250g

  // VOLUMES
  const totalWater = Math.round(dose * ratio);
  const bloomWater = Math.round(dose * BLOOM_MULT);
  const remWater = totalWater - bloomWater;
  const pourWater = FRACTIONS.map(f => Math.round(remWater * f));

  // Cumulative targets for each step
  const bloomTarget = bloomWater;
  const firstPourTarget = bloomTarget + pourWater[0];
  const secondPourTarget = firstPourTarget + pourWater[1];
  const thirdPourTarget = secondPourTarget + pourWater[2]; // should equal totalWater

  // POUR TIMES
  const pourTime = pourWater.map(w => Math.ceil(w / POUR_RATE));

  // DRAWDOWN
  const drawdown = Math.max(20, 
    DRAW_BASE
    + (6 - grindSize) * GRIND_ADJ // finer → longer
    + Math.max(0, Math.ceil((totalWater - 250) / 50)) * VOL_ADJ
  );

  // TOTAL BREW TIME
  const totalTime = T_BLOOM + pourTime.reduce((sum, t) => sum + t, 0) + T_REST * pourTime.length + drawdown;

  const steps: BrewingTimings['steps'] = [
    { label: 'Bloom', targetWater: bloomTarget, duration: T_BLOOM },
    { label: 'First Pour', targetWater: firstPourTarget, duration: pourTime[0] },
    { label: 'Rest', targetWater: firstPourTarget, duration: T_REST },
    { label: 'Second Pour', targetWater: secondPourTarget, duration: pourTime[1] },
    { label: 'Rest', targetWater: secondPourTarget, duration: T_REST },
    { label: 'Third Pour', targetWater: thirdPourTarget, duration: pourTime[2] },
    { label: 'Rest', targetWater: thirdPourTarget, duration: T_REST },
    { label: 'Drawdown', targetWater: thirdPourTarget, duration: drawdown },
  ];

  return { steps, totalWater, totalTime };
}

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// ---------------------------------------------------------------------------
//  Backwards-compatibility: old calculateBrewTiming signature used elsewhere
// ---------------------------------------------------------------------------
export function calculateBrewTiming(
  grindSize: number,
  coffeeAmount: number = 15,
  waterRatio: number = 15,
  bloomRatio: number = 2
) {
  const plan = generateBrewPlan({
    dose: coffeeAmount,
    ratio: waterRatio,
    grindSize,
    bloomRatio,
  });

  // Deconstruct steps for easy access
  const [bloom, firstPour, firstRest, secondPour, secondRest, thirdPour, thirdRest, drawdown] = plan.steps;

  return {
    // Durations
    bloomDuration: bloom.duration,
    firstPourDuration: firstPour.duration,
    restDuration: firstRest.duration,
    secondPourDuration: secondPour.duration,
    secondRestDuration: secondRest.duration,
    thirdPourDuration: thirdPour.duration,
    thirdRestDuration: thirdRest.duration,
    drawdownDuration: drawdown.duration,

    // Water targets
    bloomWater: bloom.targetWater,
    firstPourTarget: firstPour.targetWater,
    secondPourTarget: secondPour.targetWater,
    thirdPourTarget: thirdPour.targetWater,

    // Totals
    totalTime: plan.totalTime,
  } as const;
}

