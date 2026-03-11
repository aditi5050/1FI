# 1Fi Full Stack Developer Assignment

> A production-ready full-stack web application for browsing products with EMI plans, built with Next.js, MongoDB, and Tailwind CSS.

- **Deployed Demo**: _[Insert Vercel Link here]_
- **Demo Video**: _[Insert YouTube/Drive Link here]_
- **GitHub Repo**: _[Insert GitHub URL here]_

---

## Tech Stack

| Layer           | Technology                                  |
| --------------- | ------------------------------------------- |
| Frontend        | Next.js 14 (App Router), React 18, Tailwind CSS |
| Backend         | Next.js API Routes (fullstack single app)   |
| Database        | MongoDB Atlas + Mongoose ODM                |
| Containerization| Docker & Docker Compose                     |
| Testing         | Jest (unit), Cypress (e2e)                  |
| CI/CD           | GitHub Actions → Vercel                     |

---

## Project Structure

```
/project-root
  /apps
    /web                          # Next.js fullstack application
      /src
        /app
          /api
            /products             # GET /api/products
              /[slug]             # GET /api/products/:slug
            /emiplans             # GET /api/emiplans
            /preorders            # POST /api/preorders
          /products/[slug]        # Product detail page (SSR)
          /checkout               # Checkout / pre-order page
          layout.jsx              # Root layout
          page.jsx                # Homepage — product listing
          globals.css             # Tailwind base styles
        /lib
          mongoose.js             # Cached DB connection helper
        /models
          Product.js              # Mongoose Product schema
          EMIPlan.js              # Mongoose EMIPlan schema
          PreOrder.js             # Mongoose PreOrder schema
      /public/assets              # Product images
      /__tests__/api              # Jest unit tests
      /cypress/e2e                # Cypress e2e specs
  /infra
    docker-compose.yml            # Docker services (web + mongo)
    Dockerfile.web                # Next.js container
  /scripts
    seed.js                       # Database seed script
    seed.json                     # Seed data (3 products, 3 EMI plans)
  /.github/workflows
    ci.yml                        # CI pipeline (build + test)
  README.md
  package.json
  .gitignore
```

---

## Database Schema

### Product

```js
{
  name: String,           // "Apple iPhone 17 Pro"
  slug: String,           // "iphone-17-pro" (unique)
  description: String,
  mrp: Number,            // MRP (original price)
  price: Number,          // Selling price
  images: [String],       // Array of image URLs
  thumbnails: [String],   // Optional small thumbnails
  variants: [{
    sku: String,          // "IP17P-256-DB"
    color: String,        // "Deep Blue"
    storage: String,      // "256 GB"
    price: Number,
    imageIndex: Number    // Index into images[]
  }],
  createdAt: Date
}
```

### EMIPlan

```js
{
  name: String,           // "6 months EMI"
  tenureMonths: Number,   // 6
  interestRate: Number,   // 0.0 for 0% EMI
  monthlyAmount: Number,  // Computed dynamically
  cashback: Number,       // Optional
  downPayment: Number     // e.g., 19
}
```

### PreOrder (Bonus)

```js
{
  productId: ObjectId,
  productSlug: String,
  productName: String,
  variantSku: String,
  planTenure: Number,
  monthlyAmount: Number,
  downPayment: Number,
  totalPrice: Number,
  email: String,
  createdAt: Date
}
```

---

## Environment Variables

| Variable              | Description                                   | Example                                      |
| --------------------- | --------------------------------------------- | -------------------------------------------- |
| `MONGODB_URI`         | MongoDB Atlas connection string               | `mongodb+srv://user:pass@cluster.../1fi-store` |
| `NEXT_PUBLIC_API_BASE`| Base URL for API calls from the frontend      | `http://localhost:3000/api`                   |
| `PORT`                | Backend port (only if using Express separately)| `5000`                                       |

Copy `apps/web/.env.example` → `apps/web/.env` and fill in your values.

---

## Setup & Running Locally

### Prerequisites

- Node.js ≥ 18
- MongoDB Atlas account (free tier) **or** Docker Desktop

### 1. Install Dependencies

```bash
npm install
cd apps/web && npm install
```

### 2. Configure Environment

```bash
cp apps/web/.env.example apps/web/.env
# Edit apps/web/.env with your MongoDB Atlas URI
```

### 3. Seed the Database

```bash
npm run seed
```

Expected output:
```
Connecting to MongoDB...
Connected to MongoDB (readyState: 1)
Cleared existing data
Inserted seed data successfully
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running with Docker

```bash
cd infra
docker-compose up --build
```

This starts:
- **web** on port `3000` (Next.js app)
- **mongo** on port `27017` (local MongoDB)

Then seed the local database:
```bash
MONGODB_URI=mongodb://localhost:27017/1fi-store npm run seed
```

---

## API Endpoints

### `GET /api/products`

Returns all products.

**Sample curl:**
```bash
curl http://localhost:3000/api/products
```

**Response:**
```json
{
  "products": [
    {
      "_id": "66a...",
      "name": "Apple iPhone 17 Pro",
      "slug": "iphone-17-pro",
      "description": "Apple iPhone 17 Pro (Deep Blue, 256 GB)",
      "mrp": 149900,
      "price": 134900,
      "images": ["/assets/iphone17pro-1.jpg", "/assets/iphone17pro-2.jpg"],
      "variants": [
        { "sku": "IP17P-256-DB", "color": "Deep Blue", "storage": "256 GB", "price": 134900, "imageIndex": 0 },
        { "sku": "IP17P-512-DB", "color": "Deep Blue", "storage": "512 GB", "price": 154900, "imageIndex": 1 }
      ]
    }
  ]
}
```

### `GET /api/products/:slug`

Returns a single product by slug. Returns `404` for unknown slugs.

**Sample curl:**
```bash
curl http://localhost:3000/api/products/iphone-17-pro
```

**Response:**
```json
{
  "product": {
    "_id": "66a...",
    "name": "Apple iPhone 17 Pro",
    "slug": "iphone-17-pro",
    "description": "Apple iPhone 17 Pro (Deep Blue, 256 GB)",
    "mrp": 149900,
    "price": 134900,
    "images": ["/assets/iphone17pro-1.jpg", "/assets/iphone17pro-2.jpg", "/assets/iphone17pro-side.jpg"],
    "variants": [
      { "sku": "IP17P-256-DB", "color": "Deep Blue", "storage": "256 GB", "price": 134900, "imageIndex": 0 },
      { "sku": "IP17P-512-DB", "color": "Deep Blue", "storage": "512 GB", "price": 154900, "imageIndex": 1 }
    ]
  }
}
```

**404 Response:**
```json
{ "error": "Product not found" }
```

### `GET /api/emiplans?price=134900`

Returns all EMI plans. Pass `?price=<amount>` to get computed `monthlyAmount`.

**Sample curl:**
```bash
curl "http://localhost:3000/api/emiplans?price=134900"
```

**Response:**
```json
{
  "emiplans": [
    { "name": "6 months EMI", "tenureMonths": 6, "interestRate": 0, "downPayment": 19, "monthlyAmount": 22480 },
    { "name": "9 months EMI", "tenureMonths": 9, "interestRate": 0, "downPayment": 19, "monthlyAmount": 14987 },
    { "name": "12 months EMI", "tenureMonths": 12, "interestRate": 0, "downPayment": 19, "monthlyAmount": 11240 }
  ]
}
```

### `POST /api/preorders`

Creates a pre-order document in the database.

**Sample curl:**
```bash
curl -X POST http://localhost:3000/api/preorders \
  -H "Content-Type: application/json" \
  -d '{"productSlug":"iphone-17-pro","planTenure":6,"email":"user@example.com","variantSku":"IP17P-256-DB"}'
```

**Response (201):**
```json
{
  "success": true,
  "preOrder": {
    "_id": "...",
    "productSlug": "iphone-17-pro",
    "productName": "Apple iPhone 17 Pro",
    "variantSku": "IP17P-256-DB",
    "planTenure": 6,
    "monthlyAmount": 22480,
    "downPayment": 19,
    "totalPrice": 134900,
    "email": "user@example.com",
    "createdAt": "2026-03-11T..."
  }
}
```

---

## Running Tests

### Unit Tests (Jest)

```bash
npm run test
```

Tests API route handlers with mocked database connections.

### End-to-End Tests (Cypress)

First, ensure the dev server is running (`npm run dev`), then:

```bash
npm run cypress
```

Cypress test covers:
1. Visit homepage and verify product listing
2. Click product → navigate to `/products/:slug`
3. Click thumbnails → verify main image changes
4. Select EMI plan → verify CTA updates
5. Click CTA → navigate to `/checkout?product=...&plan=...`

---

## Deployment

### Vercel (Recommended)

1. Push this repo to GitHub.
2. Import the repo in [Vercel](https://vercel.com).
3. Set **Root Directory** to `apps/web`.
4. Add environment variables in Vercel dashboard:
   - `MONGODB_URI` — your Atlas connection string
   - `NEXT_PUBLIC_API_BASE` — your Vercel domain (e.g., `https://your-app.vercel.app/api`)
5. Deploy. Vercel auto-detects Next.js and builds accordingly.

### Render (Alternative for separate API)

If running Express separately:
1. Create a new Web Service on [Render](https://render.com).
2. Point to the repo, set root to `services/api`.
3. Set `MONGODB_URI` and `PORT` environment variables.
4. Deploy.

---

## Seed Data Summary

The seed script (`scripts/seed.js`) loads `scripts/seed.json` containing:

| Product             | Variants                          | Price Range       |
| ------------------- | --------------------------------- | ----------------- |
| Apple iPhone 17 Pro | 256 GB Deep Blue, 512 GB Deep Blue | ₹1,34,900 – ₹1,54,900 |
| Samsung S24 Ultra   | 256 GB Black, 512 GB Black        | ₹1,14,999 – ₹1,29,999 |
| OnePlus Nova        | 128 GB Green, 256 GB Green        | ₹43,999 – ₹48,999     |

**EMI Plans:** 6 / 9 / 12 months at 0% interest, ₹19 down payment.

---

## Features

- **Dynamic product pages** with unique slug URLs (`/products/iphone-17-pro`)
- **Server-side rendering** for SEO and fast first paint
- **Variant selection** updates price, image, and EMI calculations live
- **EMI computation** using standard formula on both server and client
- **Checkout flow** with pre-order saved to MongoDB
- **Responsive design** — mobile-first, stacks vertically on small screens
- **Thumbnail gallery** with click-to-change main image
- **0% EMI badge** green pill indicators per the reference design

---

## License

This project was built as a submission for the 1Fi Full Stack Developer Assignment.
