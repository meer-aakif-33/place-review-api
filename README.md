#  Place Review REST API

A production-quality REST API built with **Node.js, Express, Prisma, and PostgreSQL** that allows authenticated users to review places (shops, doctors, restaurants, etc.) and search them by name and rating.

This project was implemented as a **take-home assignment**, with emphasis on:

* clean architecture
* correct relational modeling
* security
* maintainability
* real-world backend trade-offs

---

##  Features

###  Authentication

* User registration with **name + phone number**
* Phone number is **globally unique**
* Secure login using **JWT (Bearer tokens)**
* All non-auth endpoints are protected

###  Places

* Each place has a **name** and **address**
* `(name, address)` is enforced as a **unique constraint at the database level**
* Places are **automatically created** when a review is added

###  Reviews

* Authenticated users can add reviews with:

  * rating (integer `1–5`)
  * review text
* A user can review a given place **only once**
* Reviews are timestamped and linked to both user and place
* Review creation is **atomic and transaction-safe**

###  Search

* Global place search by:

  * name (exact + partial, case-insensitive)
  * minimum average rating
* Exact name matches appear **before** partial matches
* Search results include:

  * place name
  * average rating (rounded to 2 decimals)

###  Place Details

* Fetch complete details for a place:

  * name
  * address
  * average rating
  * total number of reviews
  * all reviews with reviewer names
* Review ordering rules:

  1. Current user’s review appears first (if present)
  2. Remaining reviews sorted by newest first

###  Data Seeding

* Seed script included to populate:

  * sample users
  * sample places
  * multiple reviews per place
* Useful for quickly testing search, sorting, and aggregation

---

##  Architecture & Design Decisions

### Why Node.js + Express?

* Lightweight and explicit
* No hidden framework magic
* Clear control over request flow

### Why PostgreSQL?

* Strong relational guarantees
* Database-level constraints are core to the problem
* Closer to real production systems than in-memory or NoSQL stores

### Why Prisma ORM?

* Schema-first modeling
* Strong support for relations and constraints
* Clean migrations
* Readable queries (important for code review)

---

##  Project Structure

The codebase is organized by **feature**, not by file type:

```
src/
  modules/
    auth/
    places/
    reviews/
```

Each module contains:

* `controller` → HTTP layer
* `service` → business logic
* `validation` → input validation
* `routes` → route definitions

This separation improves:

* readability
* testability
* long-term maintainability

---

##  Security Considerations

* Passwords are hashed using **bcrypt**
* JWTs are stateless and short-lived
* No sensitive information stored in tokens
* All core routes require authentication
* Database constraints prevent race conditions and duplicates

---

##  Assumptions Made

1. A user can leave **only one review per place**
2. Phone number uniquely identifies a user
3. Places are uniquely identified by `(name, address)`
4. Places with no reviews have an average rating of `0`
5. Categories mentioned in the prompt were ignored due to inconsistency
6. Pagination was not required (can be added easily)

All assumptions were made consciously to keep the API predictable and clean.

---

##  Error Handling

* Centralized error handling middleware
* Consistent error response format:

  ```json
  {
    "error": {
      "message": "Human readable message"
    }
  }
  ```
* Appropriate HTTP status codes:

  * `400` – bad request / validation
  * `401` – authentication errors
  * `404` – resource not found
  * `409` – duplicate/conflict
  * `500` – internal server error

---

##  Setup & Running the Project

### Prerequisites

* Node.js (v18+ recommended)
* PostgreSQL

### Environment Variables

Create a `.env` file (see `.env.example`):

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/placereview
JWT_SECRET=your_secret_key
```

---

### Install Dependencies

```bash
npm install
```

### Run Database Migrations

```bash
npx prisma migrate dev
```

### Seed the Database

```bash
npm run seed
```

### Start the Server

```bash
npm run dev
```

Server runs at:

```
http://localhost:3000
```

---

##  API Overview

### Auth

* `POST /auth/register`
* `POST /auth/login`

### Reviews

* `POST /reviews`

### Places

* `GET /places/search`
* `GET /places/:id`

> All non-auth routes require a valid `Authorization: Bearer <token>` header.

---

##  Possible Improvements

Given more time, the following could be added:

* Pagination for search and reviews
* API tests (Jest + Supertest)
* Rate limiting
* Refresh tokens
* Database-level aggregation for search performance
* CI pipeline

---

##  Final Notes

This project was built with a **production mindset**, prioritizing:

* correctness over shortcuts
* clarity over cleverness
* maintainability over over-engineering

The goal was not just to make the API work, but to make the **design decisions easy to trust**.

---
---

## API Usage (Expected Inputs & Outputs)

### 1. Register User

**POST** `/auth/register`

**Request body**

```json
{
  "name": "Aakif",
  "phone": "9999999999",
  "password": "secret123"
}
```

**Validation**

* `name`, `phone`, `password` are required
* `phone` must be unique
* `password` must be at least 6 characters

**Success (201)**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "Aakif",
    "phone": "9999999999"
  }
}
```

---

### 2. Login

**POST** `/auth/login`

**Request body**

```json
{
  "phone": "9999999999",
  "password": "secret123"
}
```

**Success (200)**

```json
{
  "accessToken": "<JWT_TOKEN>"
}
```

**Failure (401)**

```json
{
  "error": {
    "message": "Invalid credentials"
  }
}
```

---

### 3. Add Review

**POST** `/reviews`
 Requires authentication

**Headers**

```
Authorization: Bearer <JWT_TOKEN>
```

**Request body**

```json
{
  "placeName": "Apollo Clinic",
  "address": "Hyderabad",
  "rating": 5,
  "text": "Excellent doctors"
}
```

**Validation**

* `rating` must be an integer between `1` and `5`
* A user can review a place only once

**Success (201)**

```json
{
  "message": "Review added successfully",
  "review": {
    "id": 10,
    "rating": 5,
    "text": "Excellent doctors",
    "placeId": 3,
    "userId": 1
  }
}
```

---

### 4. Search Places

**GET** `/places/search`

**Query parameters**

* `name` (optional, string)
* `minRating` (optional, integer `1–5`)

**Example**

```
GET /places/search?name=apollo&minRating=4
```

**Success (200)**

```json
{
  "count": 2,
  "results": [
    {
      "id": 3,
      "name": "Apollo Clinic",
      "averageRating": 4.5
    }
  ]
}
```

---

### 5. Place Details

**GET** `/places/:id`
  Requires authentication

**Example**

```
GET /places/3
```

**Success (200)**

```json
{
  "id": 3,
  "name": "Apollo Clinic",
  "address": "Hyderabad",
  "averageRating": 4.5,
  "reviewsCount": 4,
  "reviews": [
    {
      "rating": 5,
      "text": "Excellent doctors",
      "createdAt": "2025-01-01T10:00:00Z",
      "userName": "Aakif"
    }
  ]
  "reviewsCount":"1"
}
```

---


