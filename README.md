# Gadget Depo — REST API Visual Demo

A small ASP.NET Core application built to support the Drewity video **REST APIs Explained Visually**.

The demo intentionally mirrors the exact concepts used in the script:

- Host used in the visual explanation: `api.drewity.com`
- Main resource path: `/api/products/42`
- Main request shown in the video: `GET /api/products/42`
- Main seeded product: product `42` — **Arc 75 Mechanical Keyboard**
- Success response: `200 OK`
- Missing product example: `GET /api/products/999` → `404 Not Found`

> `api.drewity.com` is the conceptual host used in the video graphics. For the local demo, use `http://localhost:5157`.

## Run locally

```bash
dotnet run
```

Open:

```text
http://localhost:5157
```

## Video demo endpoints

### Product 42 — success

```http
GET http://localhost:5157/api/products/42
Accept: application/json
```

Expected result:

```text
200 OK
```

### Product 999 — not found

```http
GET http://localhost:5157/api/products/999
Accept: application/json
```

Expected result:

```text
404 Not Found
```

### All products

```http
GET http://localhost:5157/api/products
Accept: application/json
```

### Create a product

```http
POST http://localhost:5157/api/products
Content-Type: application/json
Accept: application/json

{
  "name": "Nova USB-C Hub",
  "price": 79.99,
  "description": "A compact USB-C hub for a clean desk setup.",
  "category": "Accessories"
}
```

Expected result:

```text
201 Created
```

### Invalid create request

```http
POST http://localhost:5157/api/products
Content-Type: application/json

{
  "name": "",
  "price": 0
}
```

Expected result:

```text
400 Bad Request
```

## Suggested recording flow

1. Open the Gadget Depo storefront.
2. Open browser DevTools → **Network**.
3. Click the keyboard product.
4. Highlight the real request to `/api/products/42`.
5. Show the `200 OK` response and JSON body.
6. Open `GadgetDepo.http` or Postman and send `GET /api/products/999`.
7. Show the `404 Not Found` response.
8. Return to the code and connect `MapGet("/api/products/{id:int}")` to the request shown in the video.

For visuals, display the conceptual request as:

```http
GET /api/products/42 HTTP/1.1
Host: api.drewity.com
Accept: application/json
```

That keeps the animation and local application perfectly aligned.

## Image credits

Product photography is loaded from Unsplash and attribution is displayed in the storefront. The main keyboard image is credited to **Eakchhung Lim / Unsplash** in the UI.
