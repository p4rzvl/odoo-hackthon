# API Documentation

All API endpoints are hosted under `/api/v1`.

## Authentication (if applicable)

- Headers: `Authorization: Bearer <token>`

( we need to implement the refrece toke + acces token so hashing salting etc also )

## Endpoints

### 1. `POST /api/v1/auth/login`

- Request body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

- Response body (200 OK):

```json
{
  "token": "eyJhbG...",
  "user": { "id": 1, "email": "user@example.com", "name": "User" }
}
```
