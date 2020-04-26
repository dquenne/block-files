interface SchemaStatic<T> {
  createEmpty(): T;
}

/**
 * @todo Use something other than Object.keys so it's okay if input is a
 * Protocol Buffer class (`Object.keys()` does not work for `get` attributes,
 * which generated ProtoBuf classes use)
 */
export function fromObject<
  T extends { [key in K]: any },
  K extends string | symbol | number
>(protoStatic: SchemaStatic<T>, input: Partial<T>) {
  const instance = protoStatic.createEmpty();
  smartKeys(input).forEach((key) => {
    instance[key] = input[key]!;
  });
  return instance;
}

function smartKeys<T>(obj: T) {
  return Object.keys(obj) as Array<keyof T>;
}

const MAXIMUM_UINT16 = 65535;

/**
 * @throws {RangeError} if value exceeds maximum UINT16 (65535)
 */
export function validateUint16(value: number): void {
  if (value > MAXIMUM_UINT16) {
    throw new RangeError(
      `value must be less than or equal to ${MAXIMUM_UINT16}`
    );
  }
}

export function floorBy(input: number, factor: number) {
  return input - (input % factor);
}
