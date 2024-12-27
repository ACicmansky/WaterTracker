import { ClimateOptions } from '@constants/enums/climateOptions.enum';

export const calculateDailyWaterTarget = (weight: number, climate: string, gender: string = 'other'): number => {
  // Base calculation: 30-35ml per kg of body weight
  // Women typically need slightly less water than men
  const baseMultiplier = gender === 'female' ? 31 : gender === 'male' ? 35 : 33;
  let baseAmount = weight * baseMultiplier;

  // Climate adjustments
  const climateMultipliers = {
    [ClimateOptions.Hot]: 1.3,     // Increase by 30% for hot climates
    [ClimateOptions.Humid]: 1.2,   // Increase by 20% for humid climates
    [ClimateOptions.Mild]: 1,      // No adjustment for mild climates
    [ClimateOptions.Cold]: 0.9,    // Decrease by 10% for cold climates
  };

  // Apply climate multiplier if available, otherwise use mild
  const multiplier = climateMultipliers[climate as keyof typeof climateMultipliers] || 1;
  
  // Calculate final amount in milliliters
  const finalAmount = Math.round(baseAmount * multiplier);

  return finalAmount;
};
