import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  MONGODB_URI: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  GOOGLE_CLIENT_ID: Joi.string().required(),
  OTP_EXPIRY_SECONDS: Joi.number().default(300),
  OTP_MAX_ATTEMPTS: Joi.number().default(5),
  OTP_RESEND_COOLDOWN_SECONDS: Joi.number().default(60),
  MAILTRAP_API_TOKEN: Joi.when('NODE_ENV', {
    is: 'production',
    then: Joi.string().required(),
    otherwise: Joi.string().allow('').optional(),
  }),
  MAILTRAP_API_URL: Joi.when('NODE_ENV', {
    is: 'production',
    then: Joi.string().uri().required(),
    otherwise: Joi.string().allow('').optional(),
  }),
  MAILTRAP_FROM_EMAIL: Joi.when('NODE_ENV', {
    is: 'production',
    then: Joi.string().email().required(),
    otherwise: Joi.string().allow('').optional(),
  }),
  MAILTRAP_FROM_NAME: Joi.string().allow('').optional(),
  MAILTRAP_HOST: Joi.string().allow('').optional(),
  MAILTRAP_PORT: Joi.number().optional(),
  MAILTRAP_USERNAME: Joi.string().allow('').optional(),
  MAILTRAP_PASSWORD: Joi.string().allow('').optional(),
  THROTTLE_TTL: Joi.number().default(60000),
  THROTTLE_LIMIT: Joi.number().default(10),
  AVATAR_CDN_BASE_URL: Joi.string().uri().optional(),
  AVATAR_UPLOAD_DIR: Joi.string().optional(),
});
