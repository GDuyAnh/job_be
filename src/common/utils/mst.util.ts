export function normalizeMstDigits(raw: string): string {
  return String(raw ?? '').replace(/\D/g, '');
}

export function isValidMstFormat(raw: string): boolean {
  const digits = normalizeMstDigits(raw);
  return digits.length === 10 || digits.length === 13;
}

export function getMstLookupVariants(raw: string): string[] {
  const digits = normalizeMstDigits(raw);
  if (!digits) return [];

  const variants = new Set<string>([digits]);

  if (digits.length === 10 && digits.startsWith('0')) {
    const withoutLeading = digits.replace(/^0+/, '');
    if (withoutLeading) variants.add(withoutLeading);
  }

  if (digits.length === 9) {
    variants.add(`0${digits}`);
    variants.add(digits.padStart(10, '0'));
  }

  if (digits.length > 0 && digits.length < 10) {
    variants.add(digits.padStart(10, '0'));
  }

  return [...variants];
}

export function canonicalMst(raw: string): string {
  const digits = normalizeMstDigits(raw);
  if (!digits) return '';
  if (digits.length === 9) return `0${digits}`;
  if (digits.length === 10 || digits.length === 13) return digits;
  return digits;
}
