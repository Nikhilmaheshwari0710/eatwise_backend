export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    uri: process.env.MONGODB_URI || '',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || '',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || '',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
  },
  otp: {
    expirySeconds: parseInt(process.env.OTP_EXPIRY_SECONDS || '300', 10),
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10),
    resendCooldownSeconds: parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS || '60', 10),
  },
  email: {
    mailtrap: {
      apiToken: process.env.MAILTRAP_API_TOKEN || '',
      apiUrl:
        process.env.MAILTRAP_API_URL || 'https://send.api.mailtrap.io/api/send',
      fromEmail: process.env.MAILTRAP_FROM_EMAIL || '',
      fromName: process.env.MAILTRAP_FROM_NAME || 'EatWise',
      host: process.env.MAILTRAP_HOST || '',
      port: parseInt(process.env.MAILTRAP_PORT || '2525', 10),
      username: process.env.MAILTRAP_USERNAME || '',
      password: process.env.MAILTRAP_PASSWORD || '',
    },
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '10', 10),
  },
  avatar: {
    cdnBaseUrl: process.env.AVATAR_CDN_BASE_URL || 'http://localhost:3000/uploads',
    uploadDir: process.env.AVATAR_UPLOAD_DIR || 'uploads/avatars',
  },
  community: {
    cdnBaseUrl:
      process.env.COMMUNITY_CDN_BASE_URL ||
      process.env.AVATAR_CDN_BASE_URL ||
      'http://localhost:3000/uploads',
    postUploadDir: process.env.COMMUNITY_POST_UPLOAD_DIR || 'uploads/posts',
  },
  affiliate: {
    shortLinkBase: process.env.AFFILIATE_SHORT_LINK_BASE || 'https://eatwise.link',
    cdnBaseUrl: process.env.AFFILIATE_CDN_BASE_URL || 'https://cdn.eatwise.app',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },
});

