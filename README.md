# MediConnect Customer Frontend

Next.js customer application integrated with the MediConnect NestJS + MongoDB API.

## API configuration

Copy `.env.example` to `.env.local`

```env
NEXT_PUBLIC_MEDICONNECT_API_URL=http://localhost:3000/api/v1
```

The API base URL must include `/api/v1`. Swagger is available at `http://localhost:3000/api-docs`.

## Run locally

```bash
npm install
npm run dev
```

The frontend runs at `http://localhost:3001` if you start it with `npm run dev -- --port 3001` (recommended because the backend defaults to port 3000).

## Backend integration notes

- Authentication uses `POST /auth/register` for both patient and doctor roles and `POST /auth/login`.
- The frontend normalizes MongoDB `_id` values to `id` and unwraps Nest `{ message, data }` responses.
- Doctor services, availability, blocked dates, appointments, payments and notifications use the routes exposed by the NestJS backend.
- Appointment availability choices are generated from the doctor's published weekly hours and blocked dates. The backend remains authoritative and rejects conflicting or invalid bookings when the appointment is submitted.
- The current backend does not expose appointment rescheduling, appointment status editing, payment-history listing, or bulk notification-read endpoints; the frontend does not call those unavailable routes.
