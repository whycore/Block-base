# Block Base MiniApp

A puzzle game built on Base blockchain where players can mint NFTs when they achieve a score of 10+ points. Built for everyone.

## 🎮 Features

- **Block Base Puzzle Game**: Match colorful blocks, create combos, and clear the board
- **NFT Minting**: Mint an NFT when you score 10+ points
- **Farcaster Integration**: Auto-connect in Farcaster/Base App environments
- **Multi-Wallet Support**: Auto-detect and connect with browser wallet extensions
- **Base Sepolia**: Deployed on Base Sepolia testnet

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Wallet with Base Sepolia ETH (for minting)
- Lighthouse API key (for IPFS uploads)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd ready_blockbase
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` and fill in:
   - `LIGHTHOUSE_API_KEY`: Your Lighthouse API key (get from https://lighthouse.storage)
   - `NEXT_PUBLIC_LIGHTHOUSE_API_KEY`: Same as above (for client-side check)
   - `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS`: Your deployed NFT contract address
   - `NEXT_PUBLIC_APP_URL`: Your Vercel deployment URL (after deployment)

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

## 📦 Deployment

### Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard:
     - `LIGHTHOUSE_API_KEY` (server-side, no `NEXT_PUBLIC_` prefix)
     - `NEXT_PUBLIC_LIGHTHOUSE_API_KEY` (client-side)
     - `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS`
     - `NEXT_PUBLIC_CHAIN_ID=84532`
     - `NEXT_PUBLIC_APP_URL` (will be auto-set by Vercel, but you can override)
   - Deploy!

3. **Update `.well-known/farcaster.json`**:
   - After deployment, update `homeUrl`, `iconUrl`, `splashImageUrl`, and `ogImageUrl` in `public/.well-known/farcaster.json` with your Vercel URL

### Deploy Smart Contract

See [DEPLOY_INSTRUCTIONS.md](./DEPLOY_INSTRUCTIONS.md) for detailed contract deployment instructions.

## 🛠️ Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy contract to Base Sepolia
- `npm run deploy:verify` - Deploy and verify contract

## 📁 Project Structure

```
ready_blockbase/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── config/           # Configuration files
│   ├── contracts/        # Smart contract ABIs
│   ├── game/             # Game logic
│   └── lib/              # Utility functions
├── contracts/            # Solidity smart contracts
├── public/               # Static assets
│   └── .well-known/      # Farcaster manifest
├── scripts/              # Deployment scripts
└── package.json
```

## 🔧 Configuration

### Environment Variables

See `.env.example` for all required environment variables.

**Required for production:**
- `LIGHTHOUSE_API_KEY`: Lighthouse API key (server-side)
- `NEXT_PUBLIC_LIGHTHOUSE_API_KEY`: Lighthouse API key (client-side)
- `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS`: Deployed NFT contract address
- `NEXT_PUBLIC_APP_URL`: Your production URL

### Smart Contract

The NFT contract is located in `contracts/GameNFT.sol`. Key features:
- ERC-721 standard
- Score threshold: 10 points
- Stores score and metadata URI per token

## 🎯 Game Rules

1. Drag and drop shapes onto the board
2. Match blocks to clear rows and columns
3. Score 10+ points to unlock NFT minting
4. Mint your achievement as an NFT on Base Sepolia

## 📝 License

MIT

## 🙏 Acknowledgments

- Built on [Base](https://base.org)
- Uses [Farcaster](https://farcaster.xyz) for social integration
- Powered by [Next.js](https://nextjs.org) and [Wagmi](https://wagmi.sh)

---

**Build for everyone** 🚀

