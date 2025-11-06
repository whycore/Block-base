# Deploy Contract ke Base Sepolia

## Metode 1: Menggunakan Script Deploy (Recommended)

### Prerequisites
1. Wallet dengan ETH di Base Sepolia (dapat dari faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
2. Private key wallet (tanpa prefix `0x`)

### Langkah-langkah

1. **Buat file `.env.local`** (jika belum ada):
   ```bash
   cp ENV_SAMPLE.md .env.local
   ```

2. **Tambahkan private key ke `.env.local`**:
   ```env
   DEPLOYER_PRIVATE_KEY=0xyour_private_key_here
   NEXT_PUBLIC_CHAIN_ID=84532
   BASESCAN_API_KEY=your_basescan_api_key   # optional (for verify)
   ```

3. **Pastikan wallet memiliki ETH di Base Sepolia**:
   - Kunjungi https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
   - Connect wallet dan minta testnet ETH

4. **Deploy contract**:
   ```bash
   npm run deploy
   ```

5. **Deploy + auto-verify (opsional, jika BASESCAN_API_KEY ada)**:
   ```bash
   npm run deploy:verify
   ```

6. **Copy contract address dari output** dan tambahkan ke `.env.local` / Vercel env:
   ```env
   NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0xYourDeployedAddressHere
   ```

7. **(Optional) Verify contract di BaseScan**:
   - Otomatis via `npm run deploy:verify`
   - Atau manual:
     ```bash
     npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS>
     ```
   - BaseScan: https://sepolia.basescan.org

---

## Metode 2: Deploy via Remix (Alternatif)

Jika script deploy tidak bekerja, Anda bisa deploy via Remix IDE:

1. **Buka Remix**: https://remix.ethereum.org

2. **Buat file baru** `GameNFT.sol` dan copy konten dari `contracts/GameNFT.sol`

3. **Install dependencies**:
   - Klik "File Explorer" → "dependencies" → buat folder baru
   - Klik "GitHub" tab
   - Install: `@openzeppelin/contracts`

4. **Compile**:
   - Pilih compiler: `0.8.28`
   - Klik "Compile GameNFT.sol"

5. **Deploy**:
   - Klik tab "Deploy & Run Transactions"
   - Environment: "Injected Provider - MetaMask" (atau wallet lain)
   - Pastikan network: Base Sepolia (Chain ID: 84532)
   - Klik "Deploy"

6. **Copy contract address** dan tambahkan ke `.env.local`:
   ```env
   NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0xYourDeployedAddressHere
   ```

---

## Setelah Deploy

1. **Update `.env.local`** dengan contract address:
   ```env
   NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0xYourDeployedAddressHere
   ```

2. **Restart dev server**:
   ```bash
   npm run dev
   ```

3. **Test minting**:
   - Play game dan capai score ≥ 1000
   - Klik "Mint NFT" button
   - Approve transaction di wallet
   - NFT akan muncul di wallet Anda

---

## Troubleshooting

### Error: "DEPLOYER_PRIVATE_KEY not found"
- Pastikan `.env.local` ada di root project
- Pastikan key format: `DEPLOYER_PRIVATE_KEY=your_key_without_0x`

### Error: "insufficient funds"
- Pastikan wallet memiliki cukup ETH di Base Sepolia
- Dapat dari faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

### Error: "nonce too low"
- Reset nonce di MetaMask: Settings → Advanced → Reset Account

### Contract tidak muncul di BaseScan
- Tunggu beberapa detik untuk indexing
- Cek di https://sepolia.basescan.org/address/0xYourAddress

---

## Security Notes

⚠️ **IMPORTANT**: 
- Jangan commit `.env.local` ke git (sudah ada di `.gitignore`)
- Private key hanya untuk deploy, jangan gunakan untuk transaksi lain
- Setelah deploy, pertimbangkan untuk memindahkan funds ke wallet lain
