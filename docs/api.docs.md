# API Specifications & Contracts

All endpoints are hosted under the base path `/api/v1`.

Authentication uses **HTTP-only, Secure, SameSite=Strict cookies** for token storage:
- `accessToken`: Short-lived token (30 minutes) for authorization.
- `refreshToken`: Long-lived token (7 days) for session maintenance.

For cross-origin calls (e.g. Next.js on port 3000 calling Express on port 5001), requests must be sent with credentials enabled (`credentials: 'include'` in fetch or `withCredentials: true` in axios). For testing tools like Postman, authorization can fallback to the standard `Authorization: Bearer <token>` header.

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/register`
Creates a new user record in a pending activation state (`isActive: false`). No cookies or tokens are issued on registration.

* **Headers**: `Content-Type: application/json`
* **Request Payload**:
  ```json
  {
    "email": "john.doe@example.com",
    "password": "securepassword123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "OFFICER",
    "phone": "+1234567890",
    "country": "Belgium"
  }
  ```
* **Validation Rules**:
  - `email`: Required, valid email format, trimmed and lowercased.
  - `password`: Required, minimum length 6 characters.
  - `firstName`: Required, minimum length 1, trimmed.
  - `lastName`: Required, minimum length 1, trimmed.
  - `role`: Required, enum values: `MANAGER`, `OFFICER`, `VENDOR` (`ADMIN` registration is forbidden).
  - `phone`: Optional string.
  - `country`: Optional string.
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": 1,
        "email": "john.doe@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "OFFICER",
        "phone": "+1234567890",
        "country": "Belgium",
        "isActive": false
      },
      "message": "Registration successful. Your account is pending Admin approval. You will be notified once activated."
    }
  }
  ```

---

### `POST /api/v1/auth/login`
Verifies credentials and issues `accessToken` and `refreshToken` cookies.

* **Headers**: `Content-Type: application/json`
* **Request Payload**:
  ```json
  {
    "email": "john.doe@example.com",
    "password": "securepassword123"
  }
  ```
* **Cookies Set**:
  - `accessToken=<token>; HttpOnly; SameSite=Strict; Max-Age=1800`
  - `refreshToken=<token>; HttpOnly; SameSite=Strict; Max-Age=604800`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": 1,
        "email": "john.doe@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "OFFICER",
        "phone": "+1234567890",
        "country": "Belgium"
      }
    }
  }
  ```
* **Failure Response (401 Unauthorized)**:
  ```json
  {
    "success": false,
    "error": "Invalid email or password."
  }
  ```
* **Failure Response (403 Forbidden - Inactive Account)**:
  ```json
  {
    "success": false,
    "error": "Your account is pending activation by an Admin. Please wait for approval."
  }
  ```

---

### `POST /api/v1/auth/refresh`
Exchanges the valid `refreshToken` cookie for a new `accessToken` cookie.

* **Cookies Sent**: `refreshToken` (HttpOnly)
* **Cookies Set**: `accessToken=<new-token>; HttpOnly; SameSite=Strict; Max-Age=1800`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Token refreshed successfully."
    }
  }
  ```
* **Failure Response (403 Forbidden)**:
  ```json
  {
    "success": false,
    "error": "Refresh token is expired, revoked, or invalid."
  }
  ```

---

### `POST /api/v1/auth/logout`
Deletes the session's refresh token from the database and clears the cookies.

* **Cookies Sent**: `refreshToken` (HttpOnly)
* **Cookies Cleared**: `accessToken`, `refreshToken`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Successfully logged out."
    }
  }
  ```

---

### `GET /api/v1/auth/me`
Retrieves details of the currently logged-in user.

* **Cookies Sent**: `accessToken` (HttpOnly)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": 1,
        "email": "john.doe@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "OFFICER",
        "phone": "+1234567890",
        "country": "Belgium",
        "isActive": true
      }
    }
  }
  ```

---

## 2. Protected Data Endpoints

### `GET /api/v1/dashboard/metrics`
Retrieves dashboard summary statistics. Access is restricted to users presenting a valid access token in cookies (or Authorization header).

* **Cookies Sent**: `accessToken` (HttpOnly)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Hello John Doe, authorized session validated!",
    "metrics": {
      "activeUsers": 142,
      "totalOrders": 320,
      "revenueUSD": 8540,
      "satisfactionRate": "98%"
    }
  }
  ```
* **Failure Response (401 Unauthorized)**:
  ```json
  {
    "success": false,
    "error": "Access token is missing or invalid. Please login."
  }
  ```
* **Failure Response (403 Forbidden)**:
  ```json
  {
    "success": false,
    "error": "Token has expired or is invalid. Access denied."
  }
  ```
