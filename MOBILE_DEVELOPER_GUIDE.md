# EatWise Mobile Developer Guide

This document is the mobile-integration handoff for the current EatWise backend.

Backend stack:

- NestJS
- TypeScript
- MongoDB
- Mongoose
- JWT authentication
- REST APIs
- Swagger

Base URL in local development:

```text
http://localhost:3000/api/v1
```

Swagger:

```text
http://localhost:3000/api/docs
```

---

## 1. Current Scope

The backend currently implements only authentication and basic user management.

Included:

- Email/password registration
- Email/password login
- Google Sign-In
- Phone OTP login
- Email verification
- Forgot password
- Reset password
- JWT access token
- Refresh token
- Logout
- Get current user profile

Not included yet:

- Child profiles
- Family sharing
- Community features
- Product scanning
- AI analysis
- Subscription/billing
- Admin features

---

## 2. User Roles

Supported mobile roles:

- `PARENT`
- `CAREGIVER`
- `COMMUNITY`

Important:

- Default registration role is `PARENT`
- Mobile app must not send or control role assignment
- Backend controls role changes

---

## 3. Authentication Model

The backend uses:

- short-lived `accessToken`
- longer-lived `refreshToken`

Use the access token in:

```http
Authorization: Bearer <accessToken>
```

When the access token expires:

1. Call refresh endpoint with the current refresh token
2. Replace both access and refresh token with the new pair

On logout:

- backend invalidates the stored refresh token

---

## 4. Standard API Response Format

### Success

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Something went wrong",
  "error": {
    "code": 400,
    "details": {}
  }
}
```

---

## 5. User Object Shape

Typical safe user object returned to mobile:

```json
{
  "id": "66c1abc123...",
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+919876543210",
  "role": "PARENT",
  "authProvider": "LOCAL",
  "isEmailVerified": false,
  "isPhoneVerified": false,
  "isActive": true,
  "lastLoginAt": "2026-08-18T09:00:00.000Z"
}
```

Backend never returns:

- `passwordHash`
- OTP values
- refresh token hash

---

## 6. Endpoints

## 6.1 Register

`POST /auth/register`

### Option A: Email registration

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "StrongP@ss1",
  "confirmPassword": "StrongP@ss1"
}
```

### Option B: Phone registration

```json
{
  "fullName": "John Doe",
  "phoneNumber": "+919876543210"
}
```

### Success response

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "66c1abc123...",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phoneNumber": null,
      "role": "PARENT",
      "authProvider": "LOCAL",
      "isEmailVerified": false,
      "isPhoneVerified": false,
      "isActive": true,
      "lastLoginAt": null
    },
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

### Mobile notes

- If registration is email-based, backend automatically triggers an email verification OTP
- Store returned tokens immediately
- If registration fails with duplicate email/phone, show user-friendly validation message

---

## 6.2 Login

`POST /auth/login`

### Request

Email login:

```json
{
  "email": "john@example.com",
  "password": "StrongP@ss1"
}
```

Phone + password login:

```json
{
  "phoneNumber": "+919876543210",
  "password": "StrongP@ss1"
}
```

### Success response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {},
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

### Mobile notes

- Use same UI error for wrong email/password
- Do not assume email is verified after login
- Check `isEmailVerified` and `isPhoneVerified`

---

## 6.3 Google Sign-In

`POST /auth/google`

### Request

```json
{
  "idToken": "google-id-token-from-mobile-sdk"
}
```

### Mobile notes

- Mobile app must send the Google ID token obtained from native Google Sign-In
- Backend verifies the token server-side
- Do not send only email/name without `idToken`

---

## 6.4 Send Phone OTP

`POST /auth/phone/send-otp`

### Request

```json
{
  "phoneNumber": "+919876543210"
}
```

### Mobile notes

- This is rate-limited
- In development, OTP may be exposed by backend for local testing
- In production, mobile should always expect only success/failure status

---

## 6.5 Verify Phone OTP

`POST /auth/phone/verify-otp`

### Request

```json
{
  "phoneNumber": "+919876543210",
  "otp": "123456"
}
```

### Success response

Returns:

- safe user object
- `accessToken`
- `refreshToken`

---

## 6.6 Send Email Verification

`POST /auth/email/send-verification`

### Auth required

Yes

### Headers

```http
Authorization: Bearer <accessToken>
```

### Request body

No body required.

### Success response

```json
{
  "success": true,
  "message": "Verification email sent",
  "data": {}
}
```

### Mobile notes

- Use this when the user wants to resend verification OTP
- If registration already triggered a verification OTP recently, backend may return cooldown-related error

---

## 6.7 Verify Email

`POST /auth/email/verify`

### Request

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

### Success response

```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {}
  }
}
```

### Mobile notes

- After success, update local user state: `isEmailVerified = true`
- OTP is one-time use and expires

---

## 6.8 Forgot Password

`POST /auth/forgot-password`

### Request

Email reset:

```json
{
  "email": "john@example.com"
}
```

Phone reset is also currently supported:

```json
{
  "phoneNumber": "+919876543210"
}
```

### Success response

```json
{
  "success": true,
  "message": "If an account exists for this email, password reset instructions have been sent.",
  "data": {}
}
```

### Mobile notes

- Always show generic success UI
- Do not try to infer whether the account exists
- For email reset, OTP is delivered through Mailtrap-backed email sending

---

## 6.9 Verify Reset OTP

`POST /auth/verify-reset-otp`

### Request

Email reset:

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

Phone reset:

```json
{
  "phoneNumber": "+919876543210",
  "otp": "123456"
}
```

### Success response

```json
{
  "success": true,
  "message": "OTP verified, use reset token to set new password",
  "data": {
    "resetToken": "temporary-reset-token"
  }
}
```

### Mobile notes

- Store `resetToken` only temporarily in memory
- Use it immediately in the next step

---

## 6.10 Reset Password

`POST /auth/reset-password`

### Request

```json
{
  "resetToken": "temporary-reset-token",
  "newPassword": "NewStrongP@ss1"
}
```

### Success response

```json
{
  "success": true,
  "message": "Password reset successful",
  "data": {}
}
```

### Mobile notes

- After success, send user to login
- Existing refresh session is invalidated

---

## 6.11 Refresh Token

`POST /auth/refresh`

### Request

```json
{
  "refreshToken": "current-refresh-token"
}
```

### Success response

```json
{
  "success": true,
  "message": "Tokens refreshed",
  "data": {
    "accessToken": "new-access-token",
    "refreshToken": "new-refresh-token"
  }
}
```

### Mobile notes

- Replace both tokens after refresh
- If refresh fails, force logout

---

## 6.12 Logout

`POST /auth/logout`

### Auth required

Yes

### Headers

```http
Authorization: Bearer <accessToken>
```

### Success response

```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": {}
}
```

### Mobile notes

- Clear local access token
- Clear local refresh token
- Clear cached user profile

---

## 6.13 Get Current User

`GET /auth/me`

### Auth required

Yes

### Headers

```http
Authorization: Bearer <accessToken>
```

### Success response

```json
{
  "success": true,
  "message": "User profile",
  "data": {
    "user": {}
  }
}
```

---

## 7. Validation Rules

### Email

- must be valid email format

### Phone

- must be E.164 format
- example: `+919876543210`

### Password

- minimum `8` characters
- at least one uppercase letter
- at least one lowercase letter
- at least one number

Example valid password:

```text
StrongP@ss1
```

---

## 8. Suggested Mobile Flows

## 8.1 Email Sign Up Flow

1. User enters full name, email, password, confirm password
2. Call `POST /auth/register`
3. Save `accessToken` and `refreshToken`
4. Move user to email verification screen
5. Ask user to enter OTP from email
6. Call `POST /auth/email/verify`
7. Update local user profile as verified

## 8.2 Resend Verification Flow

1. Logged-in user taps resend verification
2. Call `POST /auth/email/send-verification`
3. Show success or cooldown message

## 8.3 Login Flow

1. User submits email/password
2. Call `POST /auth/login`
3. Save access and refresh token
4. Call `GET /auth/me` if needed

## 8.4 Forgot Password Flow

1. User enters email
2. Call `POST /auth/forgot-password`
3. Show generic success message
4. User enters OTP from email
5. Call `POST /auth/verify-reset-otp`
6. Receive `resetToken`
7. User enters new password
8. Call `POST /auth/reset-password`
9. Redirect user to login

## 8.5 Token Refresh Flow

1. Access token expires
2. Call `POST /auth/refresh`
3. If success, replace tokens and retry request
4. If failure, logout user

---

## 9. Error Handling Guidance for Mobile

### Show user-friendly messages for:

- invalid credentials
- invalid OTP
- expired OTP
- duplicate email
- duplicate phone number
- password validation errors

### Force logout when:

- refresh token fails
- `/auth/me` returns unauthorized after refresh retry

### Treat as retryable:

- temporary network errors
- email provider unavailable
- OTP resend cooldown after wait period

---

## 10. Auth State Suggested Storage

Store securely on mobile:

- `accessToken`
- `refreshToken`
- user profile

Recommended:

- Android: encrypted shared preferences / keystore-backed storage
- iOS: keychain

Avoid storing sensitive auth state in plain local storage.

---

## 11. Example Headers

### Public request

```http
Content-Type: application/json
```

### Authenticated request

```http
Content-Type: application/json
Authorization: Bearer <accessToken>
```

---

## 12. Mailtrap Notes

The backend uses Mailtrap Email API for transactional email delivery/testing.

Current email use cases:

- email verification
- forgot password
- password reset

In development, backend may run in mock email mode if Mailtrap credentials are not configured.

This means:

- API flow still works
- external email may not actually be delivered

For real email delivery in development/staging, backend env must include:

```env
MAILTRAP_API_TOKEN=
MAILTRAP_API_URL=https://send.api.mailtrap.io/api/send
MAILTRAP_FROM_EMAIL=
MAILTRAP_FROM_NAME=EatWise
```

---

## 13. Swagger Recommendation

Before integrating from the mobile app:

1. Start backend locally
2. Open Swagger
3. Test endpoints in order:
   - register
   - login
   - send verification
   - verify email
   - forgot password
   - verify reset OTP
   - reset password
   - refresh
   - me
   - logout

---

## 14. Final Integration Notes

- Always use `/api/v1`
- Do not assume verification state; always check returned user flags
- Replace tokens on refresh
- Clear tokens on logout
- Use generic UI for forgot-password success
- Do not let mobile control role assignment
- Keep Google Sign-In dependent on real Google ID token from native SDK

---

## 15. Quick Endpoint Summary

| Method | Endpoint | Auth Required | Purpose |
|---|---|---|---|
| POST | `/auth/register` | No | Register user |
| POST | `/auth/login` | No | Login user |
| POST | `/auth/google` | No | Google Sign-In |
| POST | `/auth/phone/send-otp` | No | Send phone OTP |
| POST | `/auth/phone/verify-otp` | No | Verify phone OTP |
| POST | `/auth/email/send-verification` | Yes | Resend email verification OTP |
| POST | `/auth/email/verify` | No | Verify email OTP |
| POST | `/auth/forgot-password` | No | Start password reset |
| POST | `/auth/verify-reset-otp` | No | Verify password reset OTP |
| POST | `/auth/reset-password` | No | Set new password |
| POST | `/auth/refresh` | No | Refresh tokens |
| POST | `/auth/logout` | Yes | Logout |
| GET | `/auth/me` | Yes | Get current user |
