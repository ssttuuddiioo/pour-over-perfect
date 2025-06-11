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
  pulseCount?: number;
}

export const calculateBrewTiming = (
  grindSize: number,
  coffeeAmount: number = 15,
  waterRatio: number = 15,
  bloomRatio: number = 2
): BrewingTimings => {
  const totalWater = Math.round(coffeeAmount * waterRatio);
  const bloomWater = Math.round(coffeeAmount * bloomRatio);
  const remainingWater = totalWater - bloomWater;

  const pulseCount = 3; // Default to 3 pours

  const firstPourVolume = Math.round(remainingWater * 0.4);
  const secondPourVolume = Math.round(remainingWater * 0.35);
  const thirdPourVolume = remainingWater - firstPourVolume - secondPourVolume;

  const firstPourTarget = bloomWater + firstPourVolume;
  const secondPourTarget = firstPourTarget + secondPourVolume;
  const thirdPourTarget = totalWater;

  const pourVolume = Math.round(remainingWater / pulseCount);

  const baseTime = 120; // 2:00 base time
  const doseAdjustment = (coffeeAmount - 15) * 5; 
  const ratioAdjustment = (waterRatio - 15) * 4; 
  
  const grindAdjustment = (() => {
    switch (Number(grindSize)) {
      case 3: return 15;
      case 6: return 0;
      case 7: return -8;
      case 9: return -15;
      default: return 0;
    }
  })();
  
  let targetTime = baseTime + doseAdjustment + ratioAdjustment + grindAdjustment;
  targetTime = Math.max(90, Math.min(300, targetTime));

  const totalPourTime = targetTime * 0.4;
  const pourRate = totalWater / totalPourTime;

  const calculatePourDuration = (volume: number) => {
    return volume > 0 ? Math.round(volume / pourRate) : 0;
  };

  const firstPourDuration = calculatePourDuration(firstPourVolume);
  const secondPourDuration = calculatePourDuration(secondPourVolume);
  const thirdPourDuration = calculatePourDuration(thirdPourVolume);

  const bloomDuration = 30;
  const totalPourDuration = firstPourDuration + secondPourDuration + thirdPourDuration;
  const remainingTimeForRests = targetTime - totalPourDuration - bloomDuration;
  
  const restDuration = Math.round(remainingTimeForRests * 0.3);
  const secondRestDuration = Math.round(remainingTimeForRests * 0.3);
  const drawdownDuration = Math.round(remainingTimeForRests * 0.4);

  const durations = {
    bloomDuration,
    firstPourDuration,
    restDuration,
    secondPourDuration,
    secondRestDuration,
    thirdPourDuration,
    drawdownDuration
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

