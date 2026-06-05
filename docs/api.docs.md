# API Specifications & Contracts

All endpoints are hosted under the base path `/api/v1`.

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/register`
Creates a new user record, hashes credentials, and logs the user in (issues access/refresh tokens).

* **Headers**: `Content-Type: application/json`
* **Request Payload**:
  ```json
  {
    "email": "john.doe@example.com",
    "password": "securepassword123",
    "name": "John Doe"
  }
  ```
* **Validation Rules**:
  - `email`: Required, valid email format, trimmed and lowercased.
  - `password`: Required, minimum length 6 characters.
  - `name`: Required, minimum length 1, trimmed.
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "name": "John Doe"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MS...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MS..."
  }
  ```
* **Validation Failure Response (400 Bad Request)**:
  ```json
  {
    "success": false,
    "error": "Password must be at least 6 characters long",
    "fields": {
      "password": [
        "Password must be at least 6 characters long"
      ]
    }
  }
  ```

---

### `POST /api/v1/auth/login`
Verifies user credentials and issues session tokens.

* **Headers**: `Content-Type: application/json`
* **Request Payload**:
  ```json
  {
    "email": "john.doe@example.com",
    "password": "securepassword123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "name": "John Doe"
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbG..."
  }
  ```
* **Failure Response (401 Unauthorized)**:
  ```json
  {
    "success": false,
    "error": "Invalid email or password."
  }
  ```

---

### `POST /api/v1/auth/refresh`
Exchanges a valid refresh token for a new short-lived access token.

* **Headers**: `Content-Type: application/json`
* **Request Payload**:
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1..."
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "accessToken": "eyJhbGciOiJIUzI1Ni..."
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
Deletes/revokes the refresh token from the database, ending the user session.

* **Headers**: `Content-Type: application/json`
* **Request Payload**:
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1..."
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Successfully logged out."
  }
  ```

---

## 2. Protected Data Endpoints

### `GET /api/v1/dashboard/metrics`
Retrieves dashboard summary statistics. Access is restricted to users presenting a valid access token.

* **Headers**:
  - `Authorization: Bearer <access_token>`
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
