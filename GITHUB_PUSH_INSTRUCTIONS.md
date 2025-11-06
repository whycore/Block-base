# 📤 Push ke GitHub - Instruksi

Repository sudah siap! Ikuti langkah berikut untuk push ke GitHub:

## Opsi 1: Repository Baru di GitHub

### 1. Buat Repository Baru di GitHub
1. Buka https://github.com/new
2. Repository name: `block-base-miniapp` (atau nama lain yang Anda inginkan)
3. Description: "Block Base MiniApp - Build for everyone"
4. Pilih **Public** atau **Private**
5. **JANGAN** centang "Initialize with README" (karena kita sudah punya)
6. Klik **Create repository**

### 2. Push ke GitHub
Jalankan command berikut (ganti `<your-username>` dan `<repo-name>` dengan yang sesuai):

```bash
cd "/Users/wahyusud/Documents/JP/base mini-apps/ready_blockbase"

# Tambahkan remote (ganti dengan URL repo Anda)
git remote add origin https://github.com/<your-username>/<repo-name>.git

# Push ke GitHub
git push -u origin main
```

**Contoh:**
```bash
git remote add origin https://github.com/wahyusud/block-base-miniapp.git
git push -u origin main
```

## Opsi 2: Repository Sudah Ada

Jika repository sudah ada di GitHub:

```bash
cd "/Users/wahyusud/Documents/JP/base mini-apps/ready_blockbase"

# Tambahkan remote
git remote add origin https://github.com/<your-username>/<repo-name>.git

# Push (force jika perlu, hati-hati!)
git push -u origin main
# atau jika perlu force:
# git push -u origin main --force
```

## Setelah Push

1. ✅ Cek di GitHub: https://github.com/<your-username>/<repo-name>
2. ✅ Semua file sudah ter-upload
3. ✅ Siap untuk deploy ke Vercel!

## Troubleshooting

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/<your-username>/<repo-name>.git
```

### Error: "failed to push"
- Pastikan Anda sudah login ke GitHub
- Cek apakah repository sudah dibuat
- Coba dengan SSH: `git remote set-url origin git@github.com:<username>/<repo>.git`

---

**Siap untuk push!** 🚀

