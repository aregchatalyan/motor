import { ConfigType, registerAs } from '@nestjs/config';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsFQDN, IsIP, IsNotEmpty, IsPort, IsString, IsUrl, Matches } from 'class-validator';
import { validate } from './validate';

class EnvSchema {
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

export const envConfig = registerAs(ENV_CONFIG, () => {
  return validate(EnvSchema, process.env);
});

export type EnvConfig = ConfigType<typeof envConfig>;
