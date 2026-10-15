// PIN 원문은 서버 메모리에서만 사용. DB 유출 시 10,000개 전수 추측을 막는 별도 서버 pepper.
export function validPin(value: unknown): string {
  const pin = String(value ?? "");
  if (!/^\d{4}$/.test(pin)) throw new Error("INVALID_PIN_FORMAT");
  return pin;
}

export function pinSalt(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, "0")).join("");
}

export async function pinDigest(studentId: string, pin: string, salt: string, pepper: string): Promise<string> {
  validPin(pin);
  if (pepper.length < 32) throw new Error("PIN_NOT_CONFIGURED");
  if (!/^[a-f0-9]{32}$/.test(salt)) throw new Error("PIN_NOT_CONFIGURED");
  const encoder = new TextEncoder();
  const secret = await crypto.subtle.importKey("raw", encoder.encode(pepper), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const protectedPin = await crypto.subtle.sign("HMAC", secret, encoder.encode(`hs-pin-v1:${studentId}:${pin}`));
  const key = await crypto.subtle.importKey("raw", protectedPin, "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: encoder.encode(salt), iterations: 600000 }, key, 256);
  return Array.from(new Uint8Array(bits), b => b.toString(16).padStart(2, "0")).join("");
}
