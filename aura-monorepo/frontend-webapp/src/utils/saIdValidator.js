/**
 * Robust South African National ID Validator (Aura Security Engine)
 * Validates 13-digit South African ID numbers:
 * 1. String format: Exactly 13 numeric digits.
 * 2. Real calendar date extraction (YYMMDD): Month (01-12), days matched to calendar month (including leap years).
 * 3. Demographics extraction: Gender (0000-4999 Female, 5000-9999 Male) & Citizenship (0 SA Citizen, 1 Permanent Resident).
 * 4. Luhn Checksum Algorithm: Mathematically sound verification of the 13th check digit.
 */

export function validateSouthAfricanId(idNumber) {
  if (!idNumber || typeof idNumber !== 'string') {
    return {
      isValid: false,
      error: 'ID number is required.',
      details: null,
    };
  }

  // Remove any whitespace, hyphens, or formatting artifacts
  const cleanId = idNumber.trim().replace(/[\s-]/g, '');

  // 1. Must be exactly 13 digits
  if (!/^\d{13}$/.test(cleanId)) {
    return {
      isValid: false,
      error: 'ID number must be exactly 13 numeric digits.',
      details: null,
    };
  }

  // 2. Extract Date of Birth (YYMMDD)
  const yy = parseInt(cleanId.substring(0, 2), 10);
  const mm = parseInt(cleanId.substring(2, 4), 10);
  const dd = parseInt(cleanId.substring(4, 6), 10);

  if (mm < 1 || mm > 12) {
    return {
      isValid: false,
      error: `Invalid month (${cleanId.substring(2, 4)}) in ID number.`,
      details: null,
    };
  }

  // Determine full calendar year (2026 reference: 00-26 -> 2000s, 27-99 -> 1900s)
  const currentYear = new Date().getFullYear();
  const currentYearTwoDigits = currentYear % 100;
  const fullYear = yy <= currentYearTwoDigits ? 2000 + yy : 1900 + yy;

  // Leap year calculation: divisible by 4, not 100 unless divisible by 400
  const isLeapYear = (fullYear % 4 === 0 && fullYear % 100 !== 0) || (fullYear % 400 === 0);

  const daysInMonth = [
    31,                     // Jan
    isLeapYear ? 29 : 28,  // Feb
    31,                     // Mar
    30,                     // Apr
    31,                     // May
    30,                     // Jun
    31,                     // Jul
    31,                     // Aug
    30,                     // Sep
    31,                     // Oct
    30,                     // Nov
    31,                     // Dec
  ];

  if (dd < 1 || dd > daysInMonth[mm - 1]) {
    return {
      isValid: false,
      error: `Invalid day (${dd}) for month ${mm} in ID number.`,
      details: null,
    };
  }

  // 3. Extract Demographics
  // Gender: digits 6-9 (0000 - 4999 Female, 5000 - 9999 Male)
  const genderCode = parseInt(cleanId.substring(6, 10), 10);
  const gender = genderCode >= 5000 ? 'Male' : 'Female';

  // Citizenship: digit 10 (0 = South African citizen, 1 = Permanent resident)
  const citizenCode = parseInt(cleanId.charAt(10), 10);
  if (citizenCode !== 0 && citizenCode !== 1) {
    return {
      isValid: false,
      error: 'Invalid citizenship classification digit.',
      details: null,
    };
  }
  const citizenship = citizenCode === 0 ? 'South African Citizen' : 'Permanent Resident';

  // 4. Strict Luhn Algorithm Checksum (13th digit)
  // Step A: Sum all digits in odd positions (1st, 3rd, 5th, 7th, 9th, 11th -> indices 0, 2, 4, 6, 8, 10)
  let sumOdd = 0;
  for (let i = 0; i < 11; i += 2) {
    sumOdd += parseInt(cleanId.charAt(i), 10);
  }

  // Step B: Concatenate digits in even positions (2nd, 4th, 6th, 8th, 10th, 12th -> indices 1, 3, 5, 7, 9, 11)
  let concatEven = '';
  for (let i = 1; i < 12; i += 2) {
    concatEven += cleanId.charAt(i);
  }

  // Step C: Multiply the concatenated even digits by 2
  const evenMultiplied = (parseInt(concatEven, 10) * 2).toString();

  // Step D: Sum the individual digits of the multiplied result
  let sumEvenDigits = 0;
  for (let j = 0; j < evenMultiplied.length; j++) {
    sumEvenDigits += parseInt(evenMultiplied.charAt(j), 10);
  }

  // Step E: Total sum of odd and even results
  const total = sumOdd + sumEvenDigits;

  // Step F: Compute expected check digit
  const remainder = total % 10;
  const expectedCheckDigit = remainder === 0 ? 0 : 10 - remainder;

  // Step G: Compare with 13th digit
  const actualCheckDigit = parseInt(cleanId.charAt(12), 10);

  if (expectedCheckDigit !== actualCheckDigit) {
    return {
      isValid: false,
      error: 'ID number failed official Luhn checksum verification.',
      details: null,
    };
  }

  const formattedDob = `${fullYear}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;

  return {
    isValid: true,
    error: null,
    details: {
      dob: formattedDob,
      gender,
      citizenship,
      cleanId,
    },
  };
}

export default validateSouthAfricanId;
