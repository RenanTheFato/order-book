# Order Book
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

---

## About The Project

Order Book is a financial market order book system built with Node.js, TypeScript and Fastify. It supports limit and market orders, real-time trade execution via a matching engine, and live WebSocket broadcasting for order book updates, trades, price changes, positions and balance. Authentication is handled via JWT Bearer Token both on HTTP routes and the WebSocket connection.

---

## Features

- Limit and market order creation
- Real-time matching engine with price-time priority
- Partial and full order filling
- Order cancellation with automatic fund/position release
- Live WebSocket broadcasting for:
  - Order book depth updates
  - Trade feed
  - Price updates
  - User order status
  - User position updates
  - User balance updates
- JWT authentication on HTTP and WebSocket
- Deposit flow with confirm and cancel
- User positions tracked automatically by the matching engine

---

## Installation

### Requirements

- Node.js 24.14.0+
- PostgreSQL
- npm

### Steps

**1. Clone the repository**
```bash
git clone https://github.com/RenanTheFato/order-book.git
cd order-book
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure environment variables**
```bash
cp .env.example .env
```

**4. Run database migrations**
```bash
npx prisma migrate deploy
```

**5. Start the server**
```bash
npm run dev
```

---

## API Routes

### User — `/user`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/user/create` | No | Create a new user |
| POST | `/user/auth` | No | Authenticate and get JWT token |
| GET | `/user/profile` | Yes | Get authenticated user profile |
| DELETE | `/user/exclude` | Yes | Delete authenticated user |

### Deposit — `/deposit`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/deposit/request-deposit` | Yes | Request a deposit |
| POST | `/deposit/confirm/:deposit_id` | Yes | Confirm a deposit |
| POST | `/deposit/cancel/:deposit_id` | Yes | Cancel a deposit |
| GET | `/deposit/view/:deposit_id` | Yes | Get a deposit by ID |
| GET | `/deposit/list` | Yes | List user deposits |

### Asset — `/asset`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/asset/create` | Yes | Create a new asset |
| GET | `/asset/view/:ticker` | Yes | Get asset by ticker |
| GET | `/asset/list` | Yes | List all assets |
| GET | `/asset/order-book/:asset_id` | Yes | Get order book snapshot |

### Order — `/order`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/order/create` | Yes | Create a limit or market order |
| GET | `/order/view/:order_id` | Yes | Get an order by ID |
| GET | `/order/list` | Yes | List user orders |
| DELETE | `/order/cancel/:order_id` | Yes | Cancel an open order |

### Position — `/position`
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/position/list` | Yes | List user asset positions |

### Trade — `/trade`
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/trade/list` | Yes | List authenticated user trades |
| GET | `/trade/asset/:asset_id` | Yes | List trade history for an asset |

---

## WebSocket

Connect to `ws://localhost:3000/ws`

### Authentication
```json
{ "action": "auth", "token": "<jwt>" }
```

### Subscribing to channels
```json
{ "action": "subscribe", "channel": "order-book", "asset_id": "<uuid>" }
{ "action": "subscribe", "channel": "trades", "asset_id": "<uuid>" }
{ "action": "subscribe", "channel": "price", "asset_id": "<uuid>" }
{ "action": "subscribe", "channel": "orders" }
{ "action": "subscribe", "channel": "positions" }
```

### Events received
| Event | Channel | Description |
|---|---|---|
| `order-book:update` | `order-book:<asset_id>` | Bid/ask depth update |
| `trades:new` | `trades:<asset_id>` | New trade executed |
| `price:update` | `price:<asset_id>` | Last price changed |
| `orders:update` | `orders:<user_id>` | Order status changed |
| `positions:update` | `positions:<user_id>` | Position quantity/avg price updated |
| `balance:update` | `balance:<user_id>` | User balance updated |

---

## Project Structure

```
order-book/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── config/
│   ├── controllers/
│   │   ├── asset/
│   │   ├── deposit/
│   │   ├── order/
│   │   ├── position/
│   │   ├── trade/
│   │   └── user/
│   ├── errors/
│   ├── interfaces/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   │   ├── asset/
│   │   ├── deposit/
│   │   ├── order/
│   │   ├── position/
│   │   ├── trade/
│   │   └── user/
│   ├── @types/
│   └── websocket/
│       ├── publishers/
│       └── services/
└── tsconfig.json
```

---

## Contact

| | |
|---|---|
| Github | [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/RenanTheFato) |
| LinkedIn | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/renan-santanna) |
| Email | [![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:renan.santana.developer@gmail.com) |
| Project Link | [![Project](https://img.shields.io/badge/order--book-3178C6?style=for-the-badge&logo=files&logoColor=white)](https://github.com/RenanTheFato/order-book) |