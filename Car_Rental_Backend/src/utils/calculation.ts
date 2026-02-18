// Calculation Utilities
import { AppError, ErrorCode } from '../errors/AppError';

// 1. Calculate Tax Amount
// Note: We now pass the taxPercentage dynamically from PlatformSettings
export const calculateTax = (amount: number, taxPercentage: number): number => {
  if (amount < 0) {
    throw new AppError('Amount cannot be negative', ErrorCode.BAD_USER_INPUT);
  }
  // Formula: Amount * (Tax% / 100)
  return Math.round((amount * (taxPercentage / 100)) * 100) / 100; 
};

// 2. Calculate Total Price (Base + Tax)
export const calculateTotalPrice = (basePrice: number, taxAmount: number): number => {
  if (basePrice < 0 || taxAmount < 0) {
    throw new AppError('Prices cannot be negative', ErrorCode.BAD_USER_INPUT);
  }
  return Math.round((basePrice + taxAmount) * 100) / 100;
};

// 3. Calculate Base Price from Total (Reverse Calculation)
export const calculateBasePriceFromTotal = (totalPrice: number, taxPercentage: number): { basePrice: number; taxAmount: number } => {
  if (totalPrice < 0) {
    throw new AppError('Total price cannot be negative', ErrorCode.BAD_USER_INPUT);
  }
  
  const taxRate = taxPercentage / 100;
  
  // totalPrice = basePrice * (1 + taxRate)
  // basePrice = totalPrice / (1 + taxRate)
  const basePrice = Math.round((totalPrice / (1 + taxRate)) * 100) / 100;
  const taxAmount = Math.round((basePrice * taxRate) * 100) / 100;

  return { basePrice, taxAmount };
};

// 4. Calculate Rental Cost based on Type (Hour/Km/Day)
export const calculateRentalCost = (
  rentalType: 'HOUR' | 'KM' | 'DAY',
  rentalValue: number,
  pricePerHour: number | null,
  pricePerKm: number | null,
  pricePerDay: number | null
): number => {
  let cost = 0;

  if (rentalValue <= 0) throw new AppError('Rental value must be positive', ErrorCode.BAD_USER_INPUT);

  switch (rentalType) {
    case 'HOUR':
      if (!pricePerHour) throw new AppError('Hourly rental not available for this car', ErrorCode.BAD_USER_INPUT);
      cost = rentalValue * pricePerHour;
      break;
    case 'KM':
      if (!pricePerKm) throw new AppError('KM rental not available for this car', ErrorCode.BAD_USER_INPUT);
      cost = rentalValue * pricePerKm;
      break;
    case 'DAY':
      if (!pricePerDay) throw new AppError('Daily rental not available for this car', ErrorCode.BAD_USER_INPUT);
      cost = rentalValue * pricePerDay;
      break;
    default:
      throw new AppError('Invalid rental type', ErrorCode.BAD_USER_INPUT);
  }

  return Math.round(cost * 100) / 100;
};