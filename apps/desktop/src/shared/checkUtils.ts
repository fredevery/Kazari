export function isDefined(value: unknown): boolean {
  return value !== undefined && value !== null;
}

export function warnIfDefined(value: unknown, message: string): boolean {
  const valueIsDefined = isDefined(value);
  if (valueIsDefined) {
    console.warn(message);
  }
  return valueIsDefined;
}

export function throwIfDefined(value: unknown, message: string): boolean {
  const valueIsDefined = isDefined(value);
  if (valueIsDefined) {
    throw new Error(message);
  }
  return valueIsDefined;
}

export function warnIfUndefined(value: unknown, message: string): boolean {
  const valueIsUndefined = !isDefined(value);
  if (valueIsUndefined) {
    console.warn(message);
  }
  return valueIsUndefined;
}

export function throwIfUndefined(value: unknown, message: string): boolean {
  const valueIsUndefined = !isDefined(value);
  if (valueIsUndefined) {
    throw new Error(message);
  }
  return valueIsUndefined;
}

export function warnIfTrue(value: unknown, message: string): boolean {
  const valueIsTrue = value === true;
  if (valueIsTrue) {
    console.warn(message);
  }
  return valueIsTrue;
}

export function throwIfTrue(value: unknown, message: string): boolean {
  const valueIsTrue = value === true;
  if (valueIsTrue) {
    throw new Error(message);
  }
  return valueIsTrue;
}
export function warnIfFalse(value: unknown, message: string): boolean {
  const valueIsFalse = value === false;
  if (valueIsFalse) {
    console.warn(message);
  }
  return valueIsFalse;
}

export function throwIfFalse(value: unknown, message: string): boolean {
  const valueIsFalse = value === false;
  if (valueIsFalse) {
    throw new Error(message);
  }
  return valueIsFalse;
}
