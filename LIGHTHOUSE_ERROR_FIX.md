# 🔧 Fix: Lighthouse Upload Failed - Server Error

## Kemungkinan Penyebab

1. **LIGHTHOUSE_API_KEY tidak ter-set di Vercel** (paling umum)
   - Server route memerlukan `LIGHTHOUSE_API_KEY` (tanpa `NEXT_PUBLIC_` prefix)
   - Harus di-set di Vercel Environment Variables

2. **API Key tidak valid atau expired**
   - Cek apakah API key masih aktif
   - Generate API key baru jika perlu

3. **Lighthouse SDK error**
   - Network issue
   - API rate limit
   - Invalid response format

## Solusi

### 1. Verifikasi Environment Variables di Vercel

Pastikan **kedua** variable ini sudah di-set:

#### ✅ LIGHTHOUSE_API_KEY (Server-side)
- **Name**: `LIGHTHOUSE_API_KEY`
- **Value**: `b624b861.af749d6475a347fa90fca33b9cf5ec23`
- **Environment**: Production, Preview, Development
- ⚠️ **PENTING**: Tanpa prefix `NEXT_PUBLIC_` (untuk server route)

#### ✅ NEXT_PUBLIC_LIGHTHOUSE_API_KEY (Client-side)
- **Name**: `NEXT_PUBLIC_LIGHTHOUSE_API_KEY`
- **Value**: `b624b861.af749d6475a347fa90fca33b9cf5ec23`
- **Environment**: Production, Preview, Development
- ✅ Dengan prefix `NEXT_PUBLIC_` (untuk client check)

### 2. Cek Vercel Logs

1. Buka Vercel Dashboard → Project → **Deployments**
2. Klik deployment terbaru
3. Klik **Functions** tab
4. Cari `/api/ipfs/lighthouse`
5. Klik untuk melihat logs
6. Cari error message:
   - `LIGHTHOUSE_API_KEY not set on server` → Env var tidak ter-set
   - `Lighthouse SDK error` → API key atau network issue
   - `Failed to get CID` → Response format issue

### 3. Test API Key

Cek apakah API key valid:
- Buka: https://lighthouse.storage
- Login dan cek API keys
- Generate baru jika perlu

### 4. Redeploy Setelah Set Env Vars

Setelah set/update env vars:
1. **Redeploy** project di Vercel
2. Atau push commit baru (auto-redeploy)
3. Tunggu deployment selesai
4. Test minting lagi

## Error Messages

### "LIGHTHOUSE_API_KEY not set on server"
**Solusi**: Set `LIGHTHOUSE_API_KEY` di Vercel (tanpa `NEXT_PUBLIC_` prefix)

### "Failed to get CID from Lighthouse"
**Solusi**: 
- Cek API key valid
- Cek Vercel logs untuk detail error
- Coba generate API key baru

### "Lighthouse SDK error"
**Solusi**:
- Cek network connectivity
- Cek API rate limit
- Cek Vercel logs untuk detail

## Checklist

- [ ] `LIGHTHOUSE_API_KEY` ter-set di Vercel (tanpa NEXT_PUBLIC_)
- [ ] `NEXT_PUBLIC_LIGHTHOUSE_API_KEY` ter-set di Vercel (dengan NEXT_PUBLIC_)
- [ ] Keduanya set untuk Production, Preview, Development
- [ ] API key valid dan tidak expired
- [ ] Sudah redeploy setelah set env vars
- [ ] Cek Vercel logs untuk detail error

## Debug

Untuk debug lebih lanjut:
1. Cek Vercel Function logs: `/api/ipfs/lighthouse`
2. Cek browser console untuk error message
3. Cek Network tab untuk response dari API route

---

**Paling umum: `LIGHTHOUSE_API_KEY` tidak ter-set di Vercel!** ✅

