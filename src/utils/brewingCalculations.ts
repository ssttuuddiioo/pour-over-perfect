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
}

export const calculateBrewTiming = (
  grindSize: number,
  coffeeAmount: number = 15,
  waterRatio: number = 15,
  bloomRatio: number = 3 // Standard 3x bloom
): BrewingTimings => {
  // --- Water Calculations (Bottom-Up) ---
  const totalWater = Math.round(coffeeAmount * waterRatio);
  const bloomWater = Math.round(coffeeAmount * bloomRatio);
  const remainingWater = totalWater - bloomWater;

  // 40/60 split for the two main pours after bloom
  const firstPourVolume = Math.round(remainingWater * 0.6);
  const secondPourVolume = remainingWater - firstPourVolume;

  const firstPourTarget = bloomWater + firstPourVolume;
  const secondPourTarget = totalWater;
  
  // Third pour is not used in this simplified 3-pour model (Bloom, Pour 1, Pour 2)
  const thirdPourTarget = totalWater;

  // --- Time Calculations (Bottom-Up) ---
  const pourRate = 5; // g/s - a consistent pour rate
  const bloomDuration = 45; // seconds - increased for better saturation
  const firstPourDuration = Math.round(firstPourVolume / pourRate);
  const secondPourDuration = Math.round(secondPourVolume / pourRate);
  
  // Rest duration is proportional to the preceding pour
  const restDuration = Math.round(firstPourDuration * 1.5);
  
  // Drawdown time is influenced by total water and grind size
  const baseDrawdown = totalWater * 0.3; 
  const grindAdjustment = (grindSize - 6) * 5; // ~5s per grind setting step from medium
  const drawdownDuration = Math.round(baseDrawdown + grindAdjustment);

  const totalTime = bloomDuration + firstPourDuration + restDuration + secondPourDuration + drawdownDuration;

  return {
    bloomDuration,
    firstPourDuration,
    restDuration,
    secondPourDuration,
    secondRestDuration: 0, // Not used
    thirdPourDuration: 0, // Not used
    drawdownDuration,
    bloomWater,
    firstPourTarget,
    secondPourTarget,
    thirdPourTarget,
    totalTime,
  };
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

