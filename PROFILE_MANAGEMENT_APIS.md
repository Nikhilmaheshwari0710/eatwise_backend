# 📄 Profile Management API Documentation

**Base URL**: `http://<your-ip>:3000/api/v1`  
**Authentication**: All endpoints (except Auth) require Header:  
`Authorization: Bearer <access_token>`

---

## 📋 Table of Contents
1. [Get Profile](#1-get-profile)
2. [Update Profile](#2-update-profile)
3. [Upload Custom Photo / Avatar](#3-upload-custom-photo--avatar)
4. [Request Email Change (Send OTP)](#4-request-email-change-send-otp)
5. [Verify Email Change (Verify OTP)](#5-verify-email-change-verify-otp)
6. [Change Password / Reset Password](#6-change-password--reset-password)
7. [Account Deletion Flow](#7-account-deletion-flow)
8. [Notification Preferences](#8-notification-preferences)
9. [Avatar Presets & Reference Enums](#9-avatar-presets--reference-enums)

---

## 1. Get Profile
Fetch logged-in user profile details (Name, Email, Phone, Avatar, Gender, Language, etc.).

* **Endpoint**: `GET /user/profile`
* **Auth Required**: Yes (`Bearer <token>`)

### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "userId": "6a97d2b78afbcf3e3fe5d0e0",
    "name": "Darshan",
    "email": "demo.caregiver@eatwise.app",
    "emailVerified": true,
    "phone": "+91 98765 43210",
    "phoneVerified": false,
    "avatarUrl": "http://192.168.1.9:3000/uploads/avatars/arjun.png",
    "avatarPresetId": "arjun",
    "dateOfBirth": "1994-04-15",
    "gender": "Male",
    "preferredLanguage": "English (India)",
    "dietPreference": "Vegetarian",
    "nutritionGoal": "Focusing on wholesome sugar-free meals for my children.",
    "isPremium": true,
    "createdAt": "2026-09-02T08:16:00.000Z",
    "updatedAt": "2026-09-02T14:16:00.000Z"
  }
}
```

---

## 2. Update Profile
Update personal information (Name, Phone, DOB, Gender, Language, Diet Preference, Nutrition Goal, Avatar Preset).

* **Endpoint**: `PUT /user/profile`
* **Auth Required**: Yes (`Bearer <token>`)
* **Content-Type**: `application/json`

### Request Body
```json
{
  "name": "Darshan",
  "phone": "+91 98765 43210",
  "dateOfBirth": "1994-04-15",
  "gender": "Male",
  "preferredLanguage": "English (India)",
  "dietPreference": "Vegetarian",
  "nutritionGoal": "Focusing on wholesome sugar-free meals for my children.",
  "avatarPresetId": "arjun"
}
```

### Request Fields
| Field | Type | Required | Allowed Values / Format |
|---|---|---|---|
| `name` | string | Yes | Min 2 chars |
| `phone` | string | Yes | Format: `+91 9876543210` (with country code) |
| `dateOfBirth` | string | Optional | `YYYY-MM-DD` |
| `gender` | string | Optional | `Male`, `Female`, `Other` |
| `preferredLanguage` | string | Optional | `English (India)`, `Hindi (हिन्दी)`, `Marathi (मराठी)`, `Gujarati` |
| `dietPreference` | string | Optional | `Vegetarian`, `Vegan`, `Non-Vegetarian`, `Eggitarian`, `Jain` |
| `nutritionGoal` | string | Optional | Max 300 chars |
| `avatarPresetId` | string | Optional | `ritika` (Mom), `arjun` (Dad), `child1` (Aarav), `child2` (Myra) |

### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": {
    "userId": "6a97d2b78afbcf3e3fe5d0e0",
    "name": "Darshan",
    "email": "demo.caregiver@eatwise.app",
    "emailVerified": true,
    "phone": "+91 98765 43210",
    "phoneVerified": false,
    "avatarUrl": "http://192.168.1.9:3000/uploads/avatars/arjun.png",
    "avatarPresetId": "arjun",
    "dateOfBirth": "1994-04-15",
    "gender": "Male",
    "preferredLanguage": "English (India)",
    "dietPreference": "Vegetarian",
    "nutritionGoal": "Focusing on wholesome sugar-free meals for my children.",
    "isPremium": true,
    "updatedAt": "2026-09-02T14:16:00.000Z"
  }
}
```

---

## 3. Upload Custom Photo / Avatar
Upload a custom photo from Camera or Gallery.

* **Endpoint**: `POST /user/avatar/upload`
* **Auth Required**: Yes (`Bearer <token>`)
* **Content-Type**: `multipart/form-data`

### Request Form-Data
* `avatar`: File (JPG / PNG image, max 5 MB)

### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatarUrl": "http://192.168.1.9:3000/uploads/avatars/usr_6a97d2b78afbcf3e3fe5d0e0_1788337900.jpg"
  }
}
```

---

## 4. Request Email Change (Send OTP)
Request OTP to update registered email address.

* **Endpoint**: `POST /user/email/change-request`
* **Auth Required**: Yes (`Bearer <token>`)
* **Content-Type**: `application/json`

### Request Body
```json
{
  "newEmail": "new.darshan@gmail.com"
}
```

### Response (`200 OK`)
```json
{
  "success": true,
  "message": "OTP sent to new.darshan@gmail.com. Valid for 10 minutes.",
  "data": {}
}
```

---

## 5. Verify Email Change (Verify OTP)
Verify OTP received on new email to complete email change.

* **Endpoint**: `POST /user/email/change-verify`
* **Auth Required**: Yes (`Bearer <token>`)
* **Content-Type**: `application/json`

### Request Body
```json
{
  "newEmail": "new.darshan@gmail.com",
  "otp": "482910"
}
```

### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Email updated successfully.",
  "data": {
    "email": "new.darshan@gmail.com",
    "emailVerified": true
  }
}
```

---

## 6. Change Password / Reset Password

### 6.1 Forgot Password Request (Send OTP)
* **Endpoint**: `POST /auth/forgot-password`
* **Auth Required**: No

```json
{
  "email": "demo.caregiver@eatwise.app"
}
```

### 6.2 Verify Reset OTP
* **Endpoint**: `POST /auth/verify-reset-otp`
* **Auth Required**: No

```json
{
  "email": "demo.caregiver@eatwise.app",
  "otp": "123456"
}
```

### 6.3 Reset Password
* **Endpoint**: `POST /auth/reset-password`
* **Auth Required**: No

```json
{
  "email": "demo.caregiver@eatwise.app",
  "resetToken": "token_from_verify_otp",
  "newPassword": "NewPassword@123"
}
```

---

## 7. Account Deletion Flow

### 7.1 Initiate Account Deletion Request
* **Endpoint**: `POST /account/delete-request`
* **Auth Required**: Yes (`Bearer <token>`)

```json
{
  "reason": "privacy_concerns",
  "feedback": "No longer using this account.",
  "password": "Demo@1234"
}
```

### 7.2 Verify Deletion OTP
* **Endpoint**: `POST /account/delete-verify-otp`
* **Auth Required**: Yes (`Bearer <token>`)

```json
{
  "deleteRequestId": "del_req_123",
  "otp": "981240"
}
```

### 7.3 Permanently Delete Account
* **Endpoint**: `DELETE /account`
* **Auth Required**: Yes (`Bearer <token>`)

```json
{
  "deleteToken": "del_token_456"
}
```

---

## 8. Notification Preferences

### 8.1 Get Notification Settings
* **Endpoint**: `GET /notifications/settings`
* **Auth Required**: Yes (`Bearer <token>`)

### 8.2 Update Notification Settings
* **Endpoint**: `PUT /notifications/settings`
* **Auth Required**: Yes (`Bearer <token>`)

```json
{
  "healthAlerts": true,
  "weeklyReports": true,
  "growthMilestones": true,
  "aiTips": true,
  "productRecalls": true,
  "pushEnabled": true,
  "emailEnabled": true
}
```

---

## 9. Avatar Presets & Reference Enums

### Avatar Presets
| Preset ID | Name / Role | Preset Image Path / Target |
|---|---|---|
| `ritika` | Mom | Mother / Female Parent Avatar |
| `arjun` | Dad | Father / Male Parent Avatar |
| `child1` | Aarav | Boy Child Avatar |
| `child2` | Myra | Girl Child Avatar |

---
