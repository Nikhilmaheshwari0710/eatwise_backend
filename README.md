# EatWise Backend

AI-powered food safety and nutrition analysis backend for the EatWise mobile application.

## Tech Stack

- **Framework:** NestJS + TypeScript
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT + Passport + bcrypt
- **OAuth:** Google Sign-In (ID token verification)
- **Validation:** class-validator + class-transformer
- **Docs:** Swagger (OpenAPI)
- **Security:** Helmet, CORS, Rate Limiting
- **Transactional Email:** Mailtrap

## Mobile User Roles

This mobile backend supports an extensible user-role model for:

- `PARENT`
- `CAREGIVER`
- `COMMUNITY`

New registrations default to `PARENT`. Role assignment is controlled by backend business logic only. The mobile backend does not define or expose an `ADMIN` role or admin authentication flow. A separate admin system can be introduced later without changing mobile authentication APIs.

## Requirements

- Node.js >= 18
- MongoDB (local or Docker)
- npm

## Installation

```bash
npm install
```

## Environment Setup

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `MAILTRAP_API_TOKEN` | Mailtrap API token |
| `MAILTRAP_API_URL` | Mailtrap send endpoint |
| `MAILTRAP_FROM_EMAIL` | Sender email address |
| `MAILTRAP_HOST` | Mailtrap SMTP host for sandbox testing |
| `MAILTRAP_PORT` | Mailtrap SMTP port |
| `MAILTRAP_USERNAME` | Mailtrap SMTP username |
| `MAILTRAP_PASSWORD` | Mailtrap SMTP password |

## MongoDB Setup

**Option A: Docker**

```bash
docker-compose up -d
```

**Option B: Local MongoDB**

Install MongoDB locally and ensure it's running on `mongodb://localhost:27017`.

## Running

```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## Swagger Documentation

Once running, visit: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## API Endpoints

All endpoints are prefixed with `/api/v1`.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register with email/phone | No |
| POST | `/auth/login` | Login with email/phone + password | No |
| POST | `/auth/google` | Login with Google ID token | No |
| POST | `/auth/phone/send-otp` | Send OTP to phone | No |
| POST | `/auth/phone/verify-otp` | Verify phone OTP | No |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/verify-reset-otp` | Verify reset OTP | No |
| POST | `/auth/reset-password` | Reset password | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/logout` | Logout | Yes |
| GET | `/auth/me` | Get current user | Yes |

## Current Scope

Implemented in this phase:

- Registration
- Login
- Google Sign-In
- Phone OTP authentication
- Forgot password
- Reset password
- JWT access and refresh tokens
- Logout
- Current user profile

Explicitly not implemented in this mobile auth phase:

- Child profiles
- Family sharing flows
- Community/forum features
- Subscriptions and billing
- WhatsApp assistant
- Admin dashboard
- Admin authentication
- Reports and moderation

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

Tests use `mongodb-memory-server` — no external MongoDB needed.

## Postman Collection

Import `postman/EatWise_Auth_API.postman_collection.json` into Postman.

## Adding Real SMS Provider

The `OtpService` generates and stores OTPs. To add a real provider (Twilio, MSG91):

1. Create a new service (e.g., `TwilioSmsService`) that sends SMS
2. Inject it into `OtpService` or `AuthService`
3. Call it after OTP generation in `sendPhoneOtp()`

## Adding Real Email Provider

Transactional email is sent through the dedicated `EmailService`, which delegates to `MailtrapProvider`.

For Mailtrap setup:

1. Set `MAILTRAP_FROM_EMAIL`
2. For sandbox testing, set `MAILTRAP_HOST`, `MAILTRAP_PORT`, `MAILTRAP_USERNAME`, and `MAILTRAP_PASSWORD`
3. For sending API, set `MAILTRAP_API_TOKEN` and `MAILTRAP_API_URL`
4. Optionally set `MAILTRAP_FROM_NAME`

Development behavior:

- In `development`, missing Mailtrap credentials trigger a clearly logged mock mode.
- In `production`, missing Mailtrap configuration prevents the provider from running.

For password reset emails:

1. Create an `EmailService` (using nodemailer, SendGrid, etc.)
2. Inject into `AuthService`
3. Send email in `forgotPassword()` when type is email

## Configuring Google Sign-In

1. Create a project in Google Cloud Console
2. Enable Google Sign-In API
3. Create OAuth 2.0 credentials (for Android/iOS)
4. Set the `GOOGLE_CLIENT_ID` env variable to your client ID

## Project Architecture

```
src/
├── common/           # Shared decorators, filters, interceptors, constants
├── config/           # Configuration and validation
├── database/         # Database module
├── modules/
│   └── auth/         # Authentication module
│       ├── controllers/
│       ├── dto/
│       ├── guards/
│       ├── schemas/
│       ├── services/
│       └── strategies/
│   └── email/        # Email module with Mailtrap provider
├── app.module.ts
└── main.ts
```
