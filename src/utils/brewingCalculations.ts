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
 * Generate a very clear, three-phase pour-over recipe.
 *
 * Phases
 * 1. Bloom – fixed 30 s using bloomRatio × dose.
 * 2. First Pour – 40 % of the remaining water, poured at ~5 g / s.
 *    30 s rest afterwards.
 * 3. Second Pour – 60 % of the remaining water, poured at ~5 g / s.
 *    Draw-down time depends on total water and grind size.
 */
export function generateBrewPlan({
  dose, // coffee in grams
  ratio, // water : coffee ratio (e.g. 15)
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
  // ---------- WATER ----------
  const totalWater = Math.round(dose * ratio);
  const bloomWater = Math.round(dose * bloomRatio);
  const remainingWater = totalWater - bloomWater;

  const firstPourWater = Math.round(remainingWater * 0.4);
  const secondPourWater = remainingWater - firstPourWater; // whatever is left (60 %)

  // cumulative targets
  const firstTarget = bloomWater + firstPourWater; // after first pour
  const finalTarget = totalWater; // after second pour

  // ---------- TIME ----------
  const bloomDuration = 30; // s
  const firstPourDuration = Math.ceil(firstPourWater / pourRate);
  const restDuration = 30; // s wait after first pour
  const secondPourDuration = Math.ceil(secondPourWater / pourRate);

  // Draw-down gets slower with finer grinds & more water.
  const drawdownBase = 45; // baseline seconds
  const grindAdjustment = (grindSize - 6) * 5; // ±5 s per step from medium
  const waterAdjustment = Math.ceil((totalWater - 250) / 50) * 5; // +5 s per extra 50 g over 250 g
  const drawdownDuration = Math.max(30, drawdownBase + grindAdjustment + waterAdjustment);

  const totalTime = bloomDuration + firstPourDuration + restDuration + secondPourDuration + drawdownDuration;

  const steps: BrewingTimings['steps'] = [
    { label: 'Bloom',        targetWater: bloomWater,  duration: bloomDuration },
    { label: 'First Pour',   targetWater: firstTarget, duration: firstPourDuration },
    { label: 'Wait',         targetWater: firstTarget, duration: restDuration },
    { label: 'Second Pour',  targetWater: finalTarget, duration: secondPourDuration },
    { label: 'Drawdown',     targetWater: finalTarget, duration: drawdownDuration },
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
  const [bloom, firstPour, waitStep, secondPour, drawdown] = plan.steps;

  return {
    // Durations
    bloomDuration: bloom.duration,
    firstPourDuration: firstPour.duration,
    restDuration: waitStep.duration,
    secondPourDuration: secondPour.duration,
    secondRestDuration: 0,
    thirdPourDuration: 0,
    drawdownDuration: drawdown.duration,

    // Water targets
    bloomWater: bloom.targetWater,
    firstPourTarget: firstPour.targetWater,
    secondPourTarget: secondPour.targetWater,
    thirdPourTarget: plan.totalWater,

    // Totals
    totalTime: plan.totalTime,
  } as const;
}

