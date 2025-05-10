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

export const calculateBrewTiming = (
  grindSize: number,
  coffeeAmount: number = 15,
  waterRatio: number = 15
): BrewingTimings => {
  // Calculate total water
  const totalWater = coffeeAmount * waterRatio;
  
  // Calculate bloom water (2.7x coffee weight)
  const bloomWater = Math.round(coffeeAmount * 2.7);
  
  // Normalize grind size to a 0-1 scale (1 = finest, 11 = coarsest)
  const normalizedGrind = (grindSize - 1) / 10;
  
  // Calculate base times adjusted for coffee amount and grind size
  // More coffee and finer grinds need more time
  const volumeMultiplier = Math.sqrt(totalWater / 225); // Square root to dampen the effect
  const grindMultiplier = 1 + (1 - normalizedGrind) * 0.3; // Finer grinds get up to 30% more time
  
  // Base timings adjusted for volume and grind
  const baseTime = Math.round(30 * volumeMultiplier * grindMultiplier);
  
  // Calculate phase durations
  const bloomDuration = baseTime;
  const firstPourDuration = Math.round(baseTime * 0.5);
  const restDuration = Math.round(baseTime * 0.67);
  const secondPourDuration = Math.round(baseTime * 0.5);
  const secondRestDuration = Math.round(baseTime * 0.67);
  const thirdPourDuration = Math.round(baseTime * 0.5);
  const drawdownDuration = Math.round(baseTime * 1.5);
  
  // Calculate remaining water after bloom
  const remainingWater = totalWater - bloomWater;
  
  // Three equal pours after bloom
  const pourVolume = Math.round(remainingWater / 3);
  
  // Calculate target amounts for each phase
  const firstPourTarget = bloomWater + pourVolume;
  const secondPourTarget = firstPourTarget + pourVolume;
  const thirdPourTarget = totalWater;

  // Calculate total time
  const totalTime = bloomDuration + firstPourDuration + restDuration + 
                   secondPourDuration + secondRestDuration + thirdPourDuration + drawdownDuration;
  
  return {
    bloomDuration,
    firstPourDuration,
    restDuration,
    secondPourDuration,
    secondRestDuration,
    thirdPourDuration,
    drawdownDuration,
    bloomWater,
    firstPourTarget,
    secondPourTarget,
    thirdPourTarget,
    totalTime,
    pourVolume
  };
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};