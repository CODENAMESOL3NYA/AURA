/**
 * South African National ID Validator (Luhn Algorithm + Calendar Checks)
 *
 * Validates 13-digit South African ID numbers:
 * 1. Exactly 13 numeric digits.
 * 2. Real calendar date extraction (YYMMDD): Month (01-12) & valid day for calendar month (with leap years).
 * 3. Demographics extraction: Gender (0000-4999 Female, 5000-9999 Male) & Citizenship (0 SA Citizen, 1 Permanent Resident).
 * 4. Luhn Checksum Algorithm: Mathematically verified checksum against the 13th digit.
 */

export function validateSouthAfricanId(idNumber) {
  if (!idNumber || typeof idNumber !== 'string') {
    return {
      isValid: false,
      error: 'ID number is required and must be a string.',
      details: null,
    };
  }

  const cleanId = idNumber.trim().replace(/[\s-]/g, '');

  if (!/^\d{13}$/.test(cleanId)) {
    return {
      isValid: false,
      error: 'ID number must be exactly 13 numeric digits.',
      details: null,
    };
  }

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

  const currentYear = new Date().getFullYear();
  const currentYearTwoDigits = currentYear % 100;
  const fullYear = yy <= currentYearTwoDigits ? 2000 + yy : 1900 + yy;

  const isLeapYear = (fullYear % 4 === 0 && fullYear % 100 !== 0) || (fullYear % 400 === 0);

  const daysInMonth = [
    31,
    isLeapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  if (dd < 1 || dd > daysInMonth[mm - 1]) {
    return {
      isValid: false,
      error: `Invalid day (${dd}) for month ${mm} in ID number.`,
      details: null,
    };
  }

  // Demographics
  const genderCode = parseInt(cleanId.substring(6, 10), 10);
  const gender = genderCode >= 5000 ? 'Male' : 'Female';

  const citizenCode = parseInt(cleanId.charAt(10), 10);
  if (citizenCode !== 0 && citizenCode !== 1) {
    return {
      isValid: false,
      error: 'Invalid citizenship classification digit.',
      details: null,
    };
  }
  const citizenship = citizenCode === 0 ? 'South African Citizen' : 'Permanent Resident';

  // Luhn Algorithm Checksum
  let sumOdd = 0;
  for (let i = 0; i < 11; i += 2) {
    sumOdd += parseInt(cleanId.charAt(i), 10);
  }

  let concatEven = '';
  for (let i = 1; i < 12; i += 2) {
    concatEven += cleanId.charAt(i);
  }

  const evenMultiplied = (parseInt(concatEven, 10) * 2).toString();

  let sumEvenDigits = 0;
  for (let j = 0; j < evenMultiplied.length; j++) {
    sumEvenDigits += parseInt(evenMultiplied.charAt(j), 10);
  }

  const total = sumOdd + sumEvenDigits;
  const remainder = total % 10;
  const expectedCheckDigit = remainder === 0 ? 0 : 10 - remainder;
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
