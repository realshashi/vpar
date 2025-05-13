# vpar

A modern web application built with React, TypeScript, and Vite, featuring Solana blockchain integration.

## Tech Stack

- React 18
- TypeScript
- Vite
- TailwindCSS
- Solana Web3.js
- Socket.IO
- Zustand (State Management)
- Docker
- Nginx

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn
- Solana CLI tools (for blockchain development)
- Docker (for containerized deployment)

## Getting Started

1. Clone the repository:

```bash
git clone [repository-url]
cd vpar
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Docker Deployment

1. Build the Docker image:

```bash
docker build -t vpar .
```

2. Run the container:

```bash
docker run -p 80:80 vpar
```

The application will be available at `http://localhost`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
vpar/
├── src/              # Source files
├── public/           # Static assets
├── programs/         # Solana programs
├── tests/            # Test files
├── Dockerfile        # Docker configuration
├── nginx.conf        # Nginx configuration
└── .dockerignore     # Docker ignore file
```

## Features

- React-based frontend
- TypeScript support
- Solana blockchain integration
- Real-time updates with Socket.IO
- Modern UI with TailwindCSS
- State management with Zustand
- Containerized deployment with Docker
- Production-ready Nginx configuration

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]
