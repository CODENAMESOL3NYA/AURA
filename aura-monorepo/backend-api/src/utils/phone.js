export function toE164(input) {
  if (typeof input !== "string") return null;
  const s = input.replace(/[\s()-]/g, "");
  const m = s.match(/^(?:\+27|0)([6-8]\d{8})$/);
  return m ? `+27${m[1]}` : null;
}
