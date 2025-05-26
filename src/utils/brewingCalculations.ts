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
  pulseCount?: number; // For fruitiness adjustment
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

// Acidity affects pour speed (pour duration)
// Higher acidity = faster pour = shorter pour duration
const adjustPourDurationForAcidity = (
  duration: number, 
  acidityLevel: number = 50 // Default to middle value
): number => {
  // At acidity 50, no change
  // At acidity 100, 20% faster pour
  // At acidity 0, 20% slower pour
  const acidityAdjustment = 1 - ((acidityLevel - 50) / 250); // Range: 0.8 to 1.2
  return Math.round(duration * acidityAdjustment);
};

// Fruitiness affects number of pulse pours 
// Higher fruitiness = more pulse pours
const calculatePulseCount = (
  fruitinessLevel: number = 50 // Default to middle value
): number => {
  // At fruitiness 0: minimum 2 pulses
  // At fruitiness 50: 3 pulses (default)
  // At fruitiness 100: maximum 3 pulses
  if (fruitinessLevel <= 25) return 2;
  return 3; // Default to 3 pours for most cases
};

export const calculateBrewTiming = (
  grindSize: number,
  coffeeAmount: number = 15,
  waterRatio: number = 15,
  bloomRatio: number = 2, // Default to 2x coffee weight for bloom
  acidityLevel: number = 50, // Optional acidity level for pour speed
  fruitinessLevel: number = 50 // Optional fruitiness level for pulse count
): BrewingTimings => {
  // FIXED: Calculate water amounts with proper rounding to 1 decimal place
  const totalWater = Math.round((coffeeAmount * waterRatio) * 10) / 10;
  const bloomWater = Math.round(coffeeAmount * bloomRatio);
  const remainingWater = totalWater - bloomWater;
  
  // Determine number of pulses based on fruitiness (default behavior is 3 pours)
  const pulseCount = calculatePulseCount(fruitinessLevel);

  
  // FIXED: Properly distribute remaining water across actual number of pours
  let firstPourTarget, secondPourTarget, thirdPourTarget;
  
  if (pulseCount === 1) {
    // Single pour after bloom
    firstPourTarget = totalWater;
    secondPourTarget = totalWater;
    thirdPourTarget = totalWater;
  } else if (pulseCount === 2) {
    // Two pours after bloom
    const pourVolume = Math.round(remainingWater / 2);
    firstPourTarget = bloomWater + pourVolume;
    secondPourTarget = totalWater; // Final pour reaches total
    thirdPourTarget = totalWater;
  } else {
    // Three pours after bloom (default)
    // Distribute remaining water more evenly across the three pours
    const firstPourVolume = Math.round(remainingWater * 0.4); // 40% of remaining water
    const secondPourVolume = Math.round(remainingWater * 0.35); // 35% of remaining water
    const thirdPourVolume = remainingWater - firstPourVolume - secondPourVolume; // Remainder
    
    firstPourTarget = bloomWater + firstPourVolume;
    secondPourTarget = firstPourTarget + secondPourVolume;
    thirdPourTarget = secondPourTarget + thirdPourVolume; // This should equal totalWater
    

  }
  
  // Calculate pour volume for display purposes (average per pour)
  const pourVolume = Math.round(remainingWater / pulseCount);

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

  // Calculate individual pour durations based on volume and adjust for acidity
  let firstPourDuration = Math.round((firstPourTarget - bloomWater) / pourRate);
  let secondPourDuration = pulseCount >= 2 ? Math.round((secondPourTarget - firstPourTarget) / pourRate) : 0;
  let thirdPourDuration = pulseCount >= 3 ? Math.round((thirdPourTarget - secondPourTarget) / pourRate) : 0;
  
  // Apply acidity adjustment to pour durations
  firstPourDuration = adjustPourDurationForAcidity(firstPourDuration, acidityLevel);
  secondPourDuration = adjustPourDurationForAcidity(secondPourDuration, acidityLevel);
  thirdPourDuration = adjustPourDurationForAcidity(thirdPourDuration, acidityLevel);

  // Calculate remaining time for other phases
  const totalPourDuration = firstPourDuration + secondPourDuration + thirdPourDuration;
  
  // Fixed bloom duration - always around 30 seconds for proper extraction
  const bloomDuration = 30;
  
  // Calculate remaining time for rest phases after subtracting bloom and pours
  const remainingTime = targetTime - totalPourDuration - bloomDuration;
  
  // Adjusted phase splits for better balance
  const durations = {
    bloomDuration,
    firstPourDuration,
    // Distribute remaining time among rest and drawdown phases
    restDuration: Math.round(remainingTime * 0.25),
    secondPourDuration,
    secondRestDuration: Math.round(remainingTime * 0.25),
    thirdPourDuration,
    // Longer drawdown for better extraction
    drawdownDuration: Math.round(remainingTime * 0.50)
  };
  


  return {
    ...durations,
    bloomWater,
    firstPourTarget,
    secondPourTarget,
    thirdPourTarget,
    totalTime: targetTime,
    pourVolume,
    pulseCount
  };
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

