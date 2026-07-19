import { Decimal } from "@prisma/client/runtime/library";

export function serializeDecimals<T>(data: T): T {
  if (data instanceof Decimal) {
    return Number(data) as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => serializeDecimals(item)) as unknown as T;
  }

  if (data !== null && typeof data === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = serializeDecimals(value);
    }
    return result as T;
  }

  return data;
}