# Deployment Checklist

## Pre-Deployment

### 1. Environment Variables Setup
- [ ] Copy `.env.example` to `.env.local` for local development
- [ ] Get Lighthouse API key from https://lighthouse.storage
- [ ] Deploy NFT contract to Base Sepolia (see DEPLOY_INSTRUCTIONS.md)
- [ ] Get contract address after deployment

### 2. Local Testing
- [ ] Run `npm install`
- [ ] Set up `.env.local` with all required variables
- [ ] Run `npm run dev` and test locally
- [ ] Test wallet connection
- [ ] Test game functionality
- [ ] Test NFT minting (score 10+)

## GitHub Deployment

### 3. GitHub Repository
- [ ] Initialize git: `git init`
- [ ] Add all files: `git add .`
- [ ] Commit: `git commit -m "Initial commit: Block Base MiniApp"`
- [ ] Create GitHub repository
- [ ] Add remote: `git remote add origin <your-repo-url>`
- [ ] Push: `git push -u origin main`

## Vercel Deployment

### 4. Vercel Setup
- [ ] Go to https://vercel.com
- [ ] Import GitHub repository
- [ ] Configure environment variables in Vercel dashboard:
  - [ ] `LIGHTHOUSE_API_KEY` (server-side, no NEXT_PUBLIC_ prefix)
  - [ ] `NEXT_PUBLIC_LIGHTHOUSE_API_KEY` (client-side)
  - [ ] `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` (your deployed contract)
  - [ ] `NEXT_PUBLIC_CHAIN_ID=84532`
  - [ ] `NEXT_PUBLIC_APP_URL` (auto-set by Vercel, or override)
- [ ] Deploy!

### 5. Post-Deployment
- [ ] Get your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
- [ ] Update `public/.well-known/farcaster.json`:
  - [ ] Replace `https://your-app.vercel.app` with your actual Vercel URL
  - [ ] Commit and push changes
  - [ ] Vercel will auto-redeploy
- [ ] Test deployed app:
  - [ ] Open your Vercel URL
  - [ ] Test wallet connection
  - [ ] Test game
  - [ ] Test NFT minting

### 6. Farcaster Manifest
- [ ] Update `public/.well-known/farcaster.json` URLs
- [ ] Verify manifest is accessible at: `https://your-app.vercel.app/.well-known/farcaster.json`
- [ ] Test in Farcaster/Base App

## Verification

### 7. Final Checks
- [ ] App loads correctly on Vercel
- [ ] Wallet connection works
- [ ] Game plays correctly
- [ ] NFT minting works (score 10+)
- [ ] Farcaster manifest accessible
- [ ] All environment variables set correctly

## Troubleshooting

### Common Issues
- **Build fails**: Check environment variables in Vercel
- **NFT minting fails**: Verify contract address and network
- **Lighthouse upload fails**: Check API key is set correctly
- **Farcaster manifest not found**: Ensure `.well-known` folder is in `public/`

---

**Ready to deploy?** Follow this checklist step by step! 🚀

