# 🚀 Block Base MiniApp - Deployment Ready

Folder `ready_blockbase` sudah siap untuk deployment ke GitHub dan Vercel!

## ✅ File yang Sudah Disiapkan

### Konfigurasi
- ✅ `.gitignore` - Git ignore rules
- ✅ `.env.example` - Template environment variables
- ✅ `package.json` - Dependencies dan scripts
- ✅ `vercel.json` - Vercel configuration
- ✅ `tsconfig.json` - TypeScript config
- ✅ `next.config.ts` - Next.js config
- ✅ `hardhat.config.cjs` - Hardhat config untuk contract deployment

### Dokumentasi
- ✅ `README.md` - Main documentation
- ✅ `DEPLOY_INSTRUCTIONS.md` - Contract deployment guide
- ✅ `DEPLOYMENT_CHECKLIST.md` - Step-by-step deployment checklist

### Source Code
- ✅ `src/` - Semua source code aplikasi
- ✅ `public/` - Static assets dan Farcaster manifest
- ✅ `contracts/` - Smart contract Solidity files
- ✅ `scripts/` - Deployment scripts

## 📋 Langkah Selanjutnya

### 1. Deploy ke GitHub
```bash
cd ready_blockbase
git init
git add .
git commit -m "Initial commit: Block Base MiniApp"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy ke Vercel
1. Go to https://vercel.com
2. Import GitHub repository
3. Add environment variables (lihat `.env.example`)
4. Deploy!

### 3. Update Farcaster Manifest
Setelah deploy, update `public/.well-known/farcaster.json` dengan URL Vercel Anda.

## 🔑 Environment Variables yang Diperlukan

**Di Vercel, tambahkan:**
- `LIGHTHOUSE_API_KEY` (server-side)
- `NEXT_PUBLIC_LIGHTHOUSE_API_KEY` (client-side)
- `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` (setelah deploy contract)
- `NEXT_PUBLIC_CHAIN_ID=84532`
- `NEXT_PUBLIC_APP_URL` (auto-set oleh Vercel)

## 📝 Catatan Penting

1. **Contract Deployment**: Deploy contract dulu sebelum set `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS`
2. **Lighthouse API Key**: Dapatkan dari https://lighthouse.storage
3. **Farcaster Manifest**: Update URL setelah deploy ke Vercel
4. **Test Locally**: Test dulu dengan `npm run dev` sebelum deploy

## 🎯 Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local dengan API keys Anda
# Then run dev server
npm run dev
```

---

**Siap untuk deploy!** Ikuti `DEPLOYMENT_CHECKLIST.md` untuk panduan lengkap. 🚀
