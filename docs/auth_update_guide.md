# Auth Update Guide: Login & Register Integration

This guide is for the frontend team member updating the Login/Register pages and API calls.

---

## 🚀 1. Key Rules (Read First)

| Rule | Behavior |
|------|----------|
| **ADMIN role is FORBIDDEN** from the register form | Backend returns `403 Forbidden` — do not show ADMIN in the role dropdown |
| **Register does NOT issue tokens** | After successful register, show a pending message — user cannot log in yet |
| **Login with inactive account** | Backend returns `403` with message: *"Your account is pending activation by an Admin."* |
| **Allowed roles for self-registration** | `OFFICER`, `VENDOR`, `MANAGER` only |
| **HTTP-only Cookies for Tokens** | Token storage has migrated to secure HTTP-only cookies. Do NOT save tokens in localStorage. |
| **Cross-Origin Requests** | Use `credentials: 'include'` in all fetch calls so the browser automatically handles cookies. |

---

## 🧐 2. Mockup Clarification: "Role (Admin, officer)"

The wireframe registration screen shows a field labeled: **Role (Admin, officer)**.
* **What this means**: This was a placeholder sketch indicating that users specify their system role.
* **Our Implementation**: 
  - To prevent unauthorized access, **`ADMIN` registrations are disabled** on the public register form.
  - The dropdown options displayed to the user must be exactly: **Officer**, **Vendor**, and **Manager**.
  - System administrators are pre-seeded in the database or created directly by the database owner.

---

## 📝 3. API Schema Definitions

### Registration Request (`POST /api/v1/auth/register`)

```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "OFFICER",        // "MANAGER" | "OFFICER" | "VENDOR" — NEVER "ADMIN"
  "phone": "+919999988888",  // Optional
  "country": "India"         // Optional
}
```

### Registration Success Response (201) — **NO tokens**

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
      "isActive": false
    },
    "message": "Registration successful. Your account is pending Admin approval. You will be notified once activated."
  }
}
```
> ✅ **Frontend action**: Show a success banner with the pending message. Do NOT redirect to dashboard. Show a "Go to Login" link.

---

### Login Success Response (200) — **Cookies set automatically**

No tokens are returned in the response body. They are sent in `Set-Cookie` headers:
* `accessToken`: HttpOnly, Secure, SameSite=Strict (Expires in 30m)
* `refreshToken`: HttpOnly, Secure, SameSite=Strict (Expires in 7d)

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
      "isActive": true
    }
  }
}
```
> ✅ **Frontend action**: Set user state and redirect to `/dashboard`. Cookies are managed automatically by the browser.

### Login Pending Account (403)

```json
{
  "success": false,
  "error": "Your account is pending activation by an Admin. Please wait for approval."
}
```
> ✅ **Frontend action**: Show this exact message as a toast/banner — not a generic "invalid credentials" message.

---

## 🎨 4. Register Form Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| First Name | text | ✅ | |
| Last Name | text | ✅ | |
| Email | email | ✅ | |
| Password | password | ✅ | min 6 chars |
| Role | select | ✅ | Options: `Officer`, `Vendor`, `Manager` — **NO Admin option** |
| Phone | tel | ❌ optional | |
| Country | text | ❌ optional | |

---

## 🔑 5. Demo Accounts for Testing

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Admin | `admin@example.com` | `admin123` | Can activate users |
| Manager 1 (L1) | `manager1@example.com` | `manager123` | |
| Manager 2 (L2) | `manager2@example.com` | `manager456` | |
| Officer | `officer@example.com` | `officer123` | |
| Vendor 1 | `vendor1@example.com` | `vendor123` | |

All seeded accounts have `isActive = true` so they can log in directly.
