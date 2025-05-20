# VPAR - Web3 Sports Betting Platform

VPAR is a decentralized sports betting platform built on Solana, offering low-latency betting experiences with an order book system. The platform supports both traditional sports and esports events.

## Features

- **Decentralized Betting**: Built on Solana blockchain for fast and secure transactions
- **Event Management**: Create and manage sports and esports events
- **Token Integration**: Custom tokens for each event with built-in liquidity
- **Order Book System**: Real-time order book for efficient betting
- **Admin Panel**: Comprehensive admin interface for event management
- **Smart Contract Integration**: Rust-based smart contracts for secure betting operations

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Solana (Rust)
- **Smart Contracts**: Anchor Framework
- **Wallet Integration**: Solana Wallet Adapter
- **Token Standard**: SPL Tokens

## Prerequisites

- Node.js >= 20.18.0
- Rust and Cargo
- Solana CLI tools
- Anchor Framework

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/vpar.git
cd vpar
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```
VITE_RPC_URL=http://localhost:8899
VITE_PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
```

4. Build the Solana program:

```bash
cd programs/betting
anchor build
```

## Development

1. Start the local Solana validator:

```bash
solana-test-validator
```

2. Deploy the program:

```bash
anchor deploy
```

3. Start the development server:

```bash
npm run dev
```

## Project Structure

```
vpar/
├── programs/
│   └── betting/           # Solana program
│       ├── src/
│       │   ├── lib.rs     # Main program logic
│       │   └── utils.rs   # Utility functions
├── src/
│   ├── components/        # React components
│   ├── pages/            # React pages
│   ├── services/         # Service integrations
│   ├── store/            # State management
│   └── types/            # TypeScript types
├── public/               # Static assets
├── tests/               # Test files
├── vite.config.ts       # Vite configuration
└── tsconfig.json        # TypeScript configuration
```

## Smart Contract Features

- **Event Creation**: Create new betting events with custom tokens
- **Bet Placement**: Place bets using SPL tokens
- **Event Settlement**: Settle events and distribute winnings
- **Token Management**: Create and manage custom tokens for events

## Acknowledgments

- Solana Foundation
- Anchor Framework
- Project Serum
