export type Primitive = number | string | boolean | object | null | undefined;

export function isPrimitive(v: unknown): v is Primitive {
  return (
    typeof v === "undefined" ||
    typeof v === "number" ||
    typeof v === "string" ||
    typeof v === "object"
  );
}
