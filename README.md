# AI Trading Client

A React-based frontend for an AI-powered trading platform with real-time charts, portfolio management, and an AI trading chat assistant.

## Features

- **Landing Page** — Marketing/intro page
- **Authentication** — JWT-based login/signup
- **Onboarding** — User setup flow
- **Dashboard** — Overview with watchlist and market data
- **AI Chat** — Conversational AI trading assistant
- **Charts** — Advanced market charts powered by lightweight-charts
- **Portfolio** — Portfolio tracking and management
- **Settings** — User preferences

## Tech Stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — build tool
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [React Router](https://reactrouter.com/) — routing
- [Framer Motion](https://www.framer.com/motion/) — animations
- [lightweight-charts](https://tradingview.github.io/lightweight-charts/) — financial charts
- [Axios](https://axios-http.com/) — HTTP client

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running at `http://localhost:3000`

### Install & Run

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/       # Shared UI components (Navbar, Sidebar, Footer)
│   └── dashboard/    # Dashboard-specific widgets
├── context/          # React context (AuthContext)
├── pages/            # Route-level page components
└── utils/            # API client and helpers
```

## API

The app connects to a REST API at `http://localhost:3000`. JWT tokens are stored in `localStorage` and automatically attached to requests via an Axios interceptor.
