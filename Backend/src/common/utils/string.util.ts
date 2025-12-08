export function isSnakeCase(value: string): boolean {
  const snakeCaseRegex = /^[a-z0-9_]+$/;
  return snakeCaseRegex.test(value);
}

export function validateSnakeCase(value: string, fieldName = 'Name') {
  if (!isSnakeCase(value)) {
    throw new Error(
      `${fieldName} must be snake_case (lowercase, no spaces, use underscores).`,
    );
  }
}
