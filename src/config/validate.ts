import { validateSync } from 'class-validator';
import { ClassConstructor, plainToInstance } from 'class-transformer';

export const validate = <T extends object>(
  schema: ClassConstructor<T>,
  config: Record<string, unknown>
): T => {
  const validatedConfig = plainToInstance(schema, config);

  const results = validateSync(validatedConfig, { whitelist: true, skipMissingProperties: false });

  const errors = results.map((e) => ({
    property: e.property,
    value: e.value,
    message: e.constraints
  }));

  if (errors.length > 0) {
    console.table(errors);
    throw new Error('Some environment variables are invalid');
  }

  return validatedConfig;
}
