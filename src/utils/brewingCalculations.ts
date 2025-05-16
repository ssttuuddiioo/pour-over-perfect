import { CoffeeSettings } from '../types/brewing';

export interface BrewingTimings {
  bloomDuration: number;
  firstPourDuration: number;
  restDuration: number;
  secondPourDuration: number;
  secondRestDuration: number;
  thirdPourDuration: number;
  drawdownDuration: number;
  bloomWater: number;
  firstPourTarget: number;
  secondPourTarget: number;
  thirdPourTarget: number;
  totalTime: number;
  pourVolume: number;
}

// Calculate phase durations based on total target time
const calculatePhaseDurations = (targetTime: number) => {
  // Fixed percentages for each phase
  return {
    bloomDuration: Math.round(targetTime * 0.15),    // 15% for bloom
    firstPourDuration: Math.round(targetTime * 0.1), // 10% for first pour
    restDuration: Math.round(targetTime * 0.15),     // 15% for first rest
    secondPourDuration: Math.round(targetTime * 0.1), // 10% for second pour
    secondRestDuration: Math.round(targetTime * 0.15), // 15% for second rest
    thirdPourDuration: Math.round(targetTime * 0.1),  // 10% for third pour
    drawdownDuration: Math.round(targetTime * 0.25),  // 25% for drawdown
  };
};

export const calculateBrewTiming = (
  grindSize: number,
  coffeeAmount: number = 15,
  waterRatio: number = 15,
  bloomRatio: number = 2 // Default to 2x coffee weight for bloom
): BrewingTimings => {
  // Calculate water amounts (independent of grind size)
  const totalWater = coffeeAmount * waterRatio;
  const bloomWater = Math.round(coffeeAmount * bloomRatio);
  const remainingWater = totalWater - bloomWater;
  const pourVolume = Math.round(remainingWater / 3);
  
  // Calculate target amounts for each phase
  const firstPourTarget = bloomWater + pourVolume;
  const secondPourTarget = firstPourTarget + pourVolume;
  const thirdPourTarget = totalWater;

  // Calculate brew time (affected by grind size)
  const baseTime = 150; // 2:30 base time
  const doseAdjustment = (coffeeAmount - 15) * 10; // 10s per gram above 15g
  const ratioAdjustment = (waterRatio - 15) * 7; // 7s per point above 1:15 (reduced sensitivity)
  
  // Grind size adjustments (only affects time)
  const grindAdjustment = (() => {
    switch (Number(grindSize)) {
      case 3: return 20;  // Fine = slower
      case 6: return 0;   // Medium = baseline
      case 7: return -10; // Medium-coarse = faster
      case 9: return -20; // Coarse = fastest
      default: return 0;
    }
  })();
  
  // Calculate target total brew time
  let targetTime = baseTime + doseAdjustment + ratioAdjustment + grindAdjustment;
  
  // More flexible time cap: 1:45 to 4:00
  targetTime = Math.max(105, Math.min(240, targetTime));

  // Calculate pour durations based on water volume
  const totalPourTime = targetTime * 0.35; // 35% of total time for all pours
  const pourRate = totalWater / totalPourTime; // g/s pour rate

  // Calculate individual pour durations based on volume
  const firstPourDuration = Math.round((firstPourTarget - bloomWater) / pourRate);
  const secondPourDuration = Math.round((secondPourTarget - firstPourTarget) / pourRate);
  const thirdPourDuration = Math.round((thirdPourTarget - secondPourTarget) / pourRate);

  // Calculate remaining time for other phases
  const remainingTime = targetTime - (firstPourDuration + secondPourDuration + thirdPourDuration);
  
  // Adjusted phase splits for better balance
  const durations = {
    // Shorter bloom for shorter total times
    bloomDuration: Math.round(remainingTime * (targetTime < 180 ? 0.12 : 0.15)),
    firstPourDuration,
    // Slightly longer first rest to ensure proper bloom
    restDuration: Math.round(remainingTime * 0.22),
    secondPourDuration,
    secondRestDuration: Math.round(remainingTime * 0.22),
    thirdPourDuration,
    // Longer drawdown for better extraction
    drawdownDuration: Math.round(remainingTime * 0.44)
  };
  
  // Log timing calculations
  console.log('Brew Time Calculation:', {
    baseTime,
    doseAdjustment,
    ratioAdjustment,
    grindAdjustment,
    totalTime: targetTime,
    coffeeAmount,
    waterRatio,
    grindSize,
    pourRate: `${pourRate.toFixed(1)}g/s`,
    phaseSplits: {
      bloom: `${Math.round(durations.bloomDuration / targetTime * 100)}%`,
      pours: '35%',
      rests: '44%',
      drawdown: '44%'
    }
  });
  
  // Log phase durations
  console.log('Phase Durations:', {
    totalTime: targetTime,
    ...durations
  });

  return {
    ...durations,
    bloomWater,
    firstPourTarget,
    secondPourTarget,
    thirdPourTarget,
    totalTime: targetTime,
    pourVolume
  };
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};