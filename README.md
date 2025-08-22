# Secure Auth System

Minimal README for the auth-system backend.

Prerequisites
- Node.js (v18+ recommended)
- MySQL server
- Redis server

Quick start
1. Copy `.env.example` to `.env` and set DB/Redis credentials and `JWT_SECRET`.
2. Install dependencies:
   ```powershell
   cd auth-system
   npm install
   ```
3. Start the app (development):
   ```powershell
   npm run dev
   ```

Project structure (relevant)
- `app.js` - application entrypoint
- `config/` - DB and Redis clients
- `models/` - Sequelize models (`User`, `DeviceSession`)
- `routes/` - API routes
- `services/` - business logic (`authService`, `tokenService`, `deviceService`)
- `queues/` - Bull queues for background jobs

API documentation
- Machine-readable OpenAPI (Swagger-like) spec is in `API.txt`. You can import it into Postman or Swagger UI.

Testing the APIs (Postman)
1. Import `API.txt` into Postman as an OpenAPI/Swagger file.
2. Register a user: `POST /api/auth/register`.
3. Login: `POST /api/auth/login` -> get `accessToken` and `refreshToken`.
4. Use `Authorization: Bearer <accessToken>` header to call protected endpoints like `GET /api/users/me` and `GET /api/sessions`.

Notes
- Do not commit `.env` with real secrets. Rotate `JWT_SECRET` if leaked.
- The implementation stores refresh tokens (hashed) in Redis and uses JWT for short-lived access tokens.
