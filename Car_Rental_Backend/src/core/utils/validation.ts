export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (password.length > 128) errors.push('Password too long');
  if (!/[A-Z]/.test(password)) errors.push('Must contain uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Must contain lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Must contain number');

  return { isValid: errors.length === 0, errors };
};

export const validateCarData = (carData: any): ValidationResult => {
  const errors: string[] = [];

  if (!carData.modelId) errors.push('Model is required');
  if (!carData.plateNumber?.trim()) errors.push('Plate number is required');
  if (!carData.transmission) errors.push('Transmission is required');
  if (!carData.seats) errors.push('Seats is required');
  if (!carData.pricePerDay) errors.push('Price per day is required');
  if (!carData.critAirRating) errors.push('CritAir rating is required');
  if (!carData.year) errors.push('Year is required');

  if (carData.plateNumber && carData.plateNumber.length < 3) errors.push('Plate number too short');
  if (carData.seats && (carData.seats < 1 || carData.seats > 60)) errors.push('Invalid seats count (1-60)');
  if (carData.year && (carData.year < 1900 || carData.year > new Date().getFullYear() + 1)) errors.push('Invalid year');
  if (carData.pricePerDay && carData.pricePerDay <= 0) errors.push('Price per day must be positive');
  if (carData.depositAmount !== undefined && carData.depositAmount < 0) errors.push('Deposit cannot be negative');
  if (carData.dailyKmLimit !== undefined && carData.dailyKmLimit <= 0) errors.push('Daily KM limit must be positive');
  if (carData.extraKmCharge !== undefined && carData.extraKmCharge < 0) errors.push('Extra KM charge cannot be negative');
  if (carData.currentOdometer !== undefined && carData.currentOdometer < 0) errors.push('Current odometer cannot be negative');

  return { isValid: errors.length === 0, errors };
};

export const validateBookingInput = (input: any): ValidationResult => {
  const errors: string[] = [];

  if (!input.carId) errors.push('Car ID is required');

  if (!input.startDate || !input.endDate) {
    errors.push('Both pickup and return dates are required');
  } else {
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      errors.push('Invalid date format');
    } else {
      if (start >= end) errors.push('Return date must be after pickup date');

      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      if (start < fiveMinutesAgo) errors.push('Pickup date cannot be in the past');

      const durationMs = end.getTime() - start.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      if (durationHours < 1) errors.push('Minimum booking duration is 1 hour');

      const durationDays = durationMs / (1000 * 60 * 60 * 24);
      if (durationDays > 30) errors.push('Maximum booking duration is 30 days');

      const sixMonthsFromNow = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
      if (start > sixMonthsFromNow) errors.push('Bookings cannot be made more than 6 months in advance');
    }
  }

  return { isValid: errors.length === 0, errors };
};

export const validateCarFilterInput = (filter: any): ValidationResult => {
  const errors: string[] = [];

  if (filter.startDate || filter.endDate) {
    if (!filter.startDate || !filter.endDate) {
      errors.push('Both start date and end date must be provided when filtering by dates');
    } else {
      let start: Date, end: Date;
      try {
        start = filter.startDate.includes('T') || filter.startDate.includes(' ')
          ? new Date(filter.startDate)
          : new Date(`${filter.startDate}T10:00:00`);
        end = filter.endDate.includes('T') || filter.endDate.includes(' ')
          ? new Date(filter.endDate)
          : new Date(`${filter.endDate}T10:00:00`);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          errors.push('Invalid date format');
        } else if (start >= end) {
          errors.push('End date must be after start date');
        }
      } catch {
        errors.push('Invalid date format');
      }
    }
  }

  return { isValid: errors.length === 0, errors };
};
