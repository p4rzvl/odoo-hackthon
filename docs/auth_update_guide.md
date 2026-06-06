# Auth Update Guide: Login & Register Integration

This guide provides instructions for updating/integrating the Frontend pages to align with the expanded backend database schema and authorization structure.

---

## 🚀 1. Key Updates

The backend User model has changed:

- **Deprecated**: `name` field is no longer used.
- **Added**: `firstName`, `lastName`, `role`, `phone`, `country`, and optional `profilePhoto` fields.
- **Payload Format**: Standardized with the `{ success: true, data: { ... } }` wrapper.

---

## 📝 2. API Schema Definitions

### Registration Request (`POST /api/v1/auth/register`)

Send the following request structure:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "OFFICER", // "ADMIN" | "MANAGER" | "OFFICER" | "VENDOR"
  "phone": "+919999988888", // Optional
  "country": "India", // Optional
  "profilePhoto": null // Optional (Base64 string or file URL)
}
```

### Registration/Login Success Response

Responses now wrap data inside a nested `data` object:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "OFFICER",
      "phone": "+919999988888",
      "country": "India"
    },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

---

## 🎨 3. Action Items for Frontend Implementation

1. **Update Forms**:
   - Split the original `Name` field in the signup form into `First Name` and `Last Name`.
   - Add a `Role` dropdown selector (`OFFICER`, `VENDOR`, `MANAGER`, `ADMIN`).
   - Add optional input fields for `Phone Number` and `Country`.
   - For `Profile Photo`, a standard base64 image data URI can be uploaded (or pass null to skip storing file assets directly for now).

2. **Update API Integration**:
   - Ensure the API client parses `response.data.data.accessToken` and `response.data.data.user` (instead of `response.data.user`).
   - Standardize error handlings to read the error field from `error.response.data.error`.

---

## 🔑 4. Demo Accounts for Testing

Use the following seeded accounts during development:

| Role           | Email                  | Password     |
| -------------- | ---------------------- | ------------ |
| Admin          | `admin@example.com`    | `admin123`   |
| Manager 1 (L1) | `manager1@example.com` | `manager123` |
| Manager 2 (L2) | `manager2@example.com` | `manager456` |
| Officer        | `officer@example.com`  | `officer123` |
| Vendor 1       | `vendor1@example.com`  | `vendor123`  |
