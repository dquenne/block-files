interface SchemaStatic<T> {
  createEmpty(): T;
}

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
