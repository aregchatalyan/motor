import { ConfigType, registerAs } from '@nestjs/config';
import { ClassConstructor, plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsFQDN,
  IsIP,
  IsNotEmpty,
  IsPort,
  IsString,
  IsUrl,
  Matches,
  validateSync
} from 'class-validator';

export class EnvSchema {
  @IsIP()
  HOST: string;
  @IsPort()
  PORT: string;
  @IsBoolean()
  DEBUG: boolean;

  @IsString()
  @Matches(/^[a-f0-9]{20,}$/i, { message: 'JWT_ACCESS_SECRET must be at least 20 hex characters' })
  JWT_ACCESS_SECRET: string;
  @IsString()
  @Matches(/^[a-f0-9]{20,}$/i, { message: 'JWT_REFRESH_SECRET must be at least 20 hex characters' })
  JWT_REFRESH_SECRET: string;
  @IsString()
  @Matches(/^\d+([mhd])$/i, { message: 'JWT_ACCESS_EXPIRES must be like "15m", "1h", or "7d"' })
  JWT_ACCESS_EXPIRES: string;
  @IsString()
  @Matches(/^\d+([mhd])$/i, { message: 'JWT_REFRESH_EXPIRES must be like "15m", "1h", or "7d"' })
  JWT_REFRESH_EXPIRES: string;

  @IsFQDN()
  SMTP_HOST: string;
  @IsPort()
  SMTP_PORT: string;
  @IsEmail()
  SMTP_USER: string;
  @IsString()
  @IsNotEmpty()
  SMTP_PASS: string;
  @IsBoolean()
  SMTP_SECURE: boolean;

  @IsString()
  @IsNotEmpty()
  POSTGRES_DB: string;
  @IsString()
  @IsNotEmpty()
  POSTGRES_USER: string;
  @IsString()
  @IsNotEmpty()
  POSTGRES_PASSWORD: string;
  @IsString()
  @IsNotEmpty()
  POSTGRES_HOST: string;
  @IsPort()
  POSTGRES_PORT: string;
  @IsString()
  @IsNotEmpty()
  POSTGRES_URL: string;

  @IsEmail()
  ADMIN_EMAIL: string;

  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch (e) {
      throw new Error('CLIENT_URL must be a valid JSON array of URLs');
    }
  })
  @IsUrl({ require_tld: false }, { each: true })
  CLIENTS: string[];
}

export const ENV_CONFIG = 'env';
export type EnvConfig = ConfigType<typeof envConfig>;

export const envConfig = registerAs(ENV_CONFIG, () => {
  const env = validate(EnvSchema, process.env);

  return {
    HOST: env.HOST,
    PORT: env.PORT,
    DEBUG: env.DEBUG,
    JWT_ACCESS_SECRET: env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRES: env.JWT_ACCESS_EXPIRES,
    JWT_REFRESH_EXPIRES: env.JWT_REFRESH_EXPIRES,
    SMTP_HOST: env.SMTP_HOST,
    SMTP_PORT: env.SMTP_PORT,
    SMTP_USER: env.SMTP_USER,
    SMTP_PASS: env.SMTP_PASS,
    SMTP_SECURE: env.SMTP_SECURE,
    POSTGRES_DB: env.POSTGRES_DB,
    POSTGRES_USER: env.POSTGRES_USER,
    POSTGRES_PASSWORD: env.POSTGRES_PASSWORD,
    POSTGRES_HOST: env.POSTGRES_HOST,
    POSTGRES_PORT: env.POSTGRES_PORT,
    POSTGRES_URL: env.POSTGRES_URL,
    ADMIN_EMAIL: env.ADMIN_EMAIL,
    CLIENTS: env.CLIENTS
  }
});

export function validate<T extends object>(
  schema: ClassConstructor<T>,
  config: Record<string, unknown>
): T {
  const validatedConfig = plainToInstance(schema, config, {
    enableImplicitConversion: true
  });

  const results = validateSync(validatedConfig, {
    whitelist: true,
    skipMissingProperties: false
  });

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
