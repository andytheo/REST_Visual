# Authentication vs Authorization demo

This file documents the demo flow used to validate the next video.

## Important

The login credentials and bearer tokens in this project are deliberately simple, hard-coded demo values. They exist only to make authentication and authorization behavior easy to see in Postman. They are **not** a production authentication design.

## Postman flow

1. `GET /api/orders` with no `Authorization` header -> `401 Unauthorized`.
2. `POST /api/auth/login` with `customer` / `demo123` -> returns the opaque demo bearer token `gadget-customer-token`.
3. `GET /api/orders` with `Authorization: Bearer gadget-customer-token` -> `200 OK`.
4. `GET /api/admin/inventory` with the same customer token -> `403 Forbidden` because the authenticated customer does not meet the `AdminOnly` role policy.
5. `POST /api/auth/login` with `admin` / `admin123` -> returns `gadget-admin-token`.
6. `GET /api/admin/inventory` with the admin token -> `200 OK`.

The CI workflow executes these behaviors as smoke tests.
