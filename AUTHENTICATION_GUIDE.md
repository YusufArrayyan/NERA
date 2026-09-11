# 🔐 Panduan Authentication & Testing Dashboard

**Dibuat**: 29 Agustus 2026  
**Tujuan**: Panduan lengkap untuk login, register, dan test semua dashboard NERA

---

## 🎯 Alur Authentication

### 1. **Landing Page** → `/`
- Halaman pertama yang dikunjungi
- Tombol "Mulai Sekarang" → redirect ke `/auth/login`
- Tombol "Lihat Demo" → redirect ke `/demo`

### 2. **Login Page** → `/auth/login`
- User harus login terlebih dahulu sebelum akses dashboard
- Jika belum punya akun → klik "Daftar" untuk register

### 3. **Authentication Check**
- Setiap dashboard punya **auth guard**
- Jika belum login → auto redirect ke `/auth/login`
- Session disimpan di `localStorage` dengan key `user`

---

## 👥 Demo Accounts (Testing)

### **Akun Demo Tersedia:**

| Role | Email | Password | Dashboard Access |
|------|-------|----------|------------------|
| **Student** | `siswa@nera.demo` | `Demo1234!` | `/dashboard/student` |
| **Teacher** | `guru@nera.demo` | `Demo1234!` | `/dashboard/teacher` |
| **Admin** | `admin@nera.demo` | `Demo1234!` | `/dashboard/admin` |

---

## 🧪 Cara Test Berbagai Dashboard

### **Option 1: Login & Logout**

1. **Buka** `/auth/login`
2. **Login** dengan `siswa@nera.demo` → Dashboard Student
3. **Klik avatar** (pojok kanan atas) → **Profil**
4. **Scroll bawah** → klik **"Keluar Akun"**
5. **Login lagi** dengan `guru@nera.demo` → Dashboard Teacher
6. **Ulangi** untuk test dashboard lain

### **Option 2: Direct URL (Setelah Login)**

Setelah login, ganti URL browser langsung:

```
Student Dashboard:  http://localhost:3000/dashboard/student
Teacher Dashboard:  http://localhost:3000/dashboard/teacher
Admin Dashboard:    http://localhost:3000/dashboard/admin
```

---

## 🔍 Fitur yang Sekarang Functional

### ✅ **Navigation Bar**
- **Logo NERA** → klik untuk ke landing page
- **Beranda** → ke dashboard utama
- **Statistik** → ke `/analytics`
- **Jurnal** → ke `/journal`
- **Hardware** → ke `/hardware/calibration`

### ✅ **Top Right Icons**
- **Bluetooth Icon** → Status koneksi (indicator saja)
- **Sensor Icon** → Signal quality 98% (indicator)
- **Battery Icon** → Battery 84% (indicator)
- **Notification Bell** → `/notifications` (baru dibuat!)
- **Settings Gear** → `/settings` (baru dibuat!)
- **Avatar & Name** → `/dashboard/student/profile`

---

## 📱 Halaman Baru yang Ditambahkan

### 1. **Settings Page** - `/settings`
**Fitur:**
- Informasi Profil
- Keamanan & Privasi
- Notifikasi
- Tampilan
- Bahasa
- Pusat Bantuan
- **Tombol Logout**

**Akses:** Klik icon gear (⚙️) di top bar

### 2. **Notifications Page** - `/notifications`
**Fitur:**
- List semua notifikasi
- Indicator "baru" untuk unread notifications
- Type: success, warning, info
- Real-time notifications (mock data for now)

**Akses:** Klik icon bell (🔔) di top bar

---

## 🚀 Flow Testing Complete

### **Scenario 1: Student Journey**

```
1. Buka http://localhost:3000
2. Klik "Mulai Sekarang"
3. Login: siswa@nera.demo / Demo1234!
4. Dashboard Student terbuka
5. Klik "Statistik" → lihat stats
6. Klik bell icon → notifikasi
7. Klik gear icon → settings
8. Klik avatar → profil
9. Logout dari profil page
```

### **Scenario 2: Teacher Journey**

```
1. Buka http://localhost:3000/auth/login
2. Login: guru@nera.demo / Demo1234!
3. Dashboard Teacher terbuka
4. Lihat real-time class monitoring
5. Klik settings → logout
```

### **Scenario 3: Admin Journey**

```
1. Buka http://localhost:3000/auth/login
2. Login: admin@nera.demo / Demo1234!
3. Dashboard Admin terbuka
4. Lihat sistem management
5. Test navigation
```

---

## 🔐 Security Features

### **Authentication Guard**
```typescript
useEffect(() => {
  // Check if user is authenticated
  const user = localStorage.getItem('user');
  if (!user) {
    router.push('/auth/login');
    return;
  }
}, [router]);
```

### **Protected Routes**
- `/dashboard/*` → requires login
- `/settings` → requires login
- `/notifications` → requires login
- `/profile` → requires login

### **Public Routes**
- `/` (landing)
- `/auth/login`
- `/auth/register`
- `/demo`

---

## 🎨 Layout Improvements

### **Before:**
- ❌ Logo tidak bisa diklik
- ❌ Settings icon tidak functional
- ❌ Notifications icon tidak functional
- ❌ Avatar tidak bisa diklik
- ❌ Tidak ada halaman settings
- ❌ Tidak ada halaman notifications

### **After:**
- ✅ Logo → redirect ke landing page
- ✅ Settings icon → `/settings` page
- ✅ Notifications icon → `/notifications` page
- ✅ Avatar → `/dashboard/student/profile`
- ✅ Halaman settings lengkap
- ✅ Halaman notifications dengan UI/UX bagus

---

## 🧭 Navigation Map

```
Landing Page (/)
├─ Login (/auth/login)
│  ├─ Student Dashboard (/dashboard/student)
│  │  ├─ Profile (/dashboard/student/profile)
│  │  ├─ Stats (/dashboard/student/stats)
│  │  ├─ Settings (/settings)
│  │  └─ Notifications (/notifications)
│  ├─ Teacher Dashboard (/dashboard/teacher)
│  │  ├─ Profile (/dashboard/teacher/profile)
│  │  ├─ Settings (/settings)
│  │  └─ Notifications (/notifications)
│  └─ Admin Dashboard (/dashboard/admin)
│     ├─ Profile (/dashboard/admin/profile)
│     ├─ Settings (/settings)
│     └─ Notifications (/notifications)
└─ Register (/auth/register)
```

---

## 📝 Testing Checklist

### **Login Flow**
- [ ] Landing page loads
- [ ] "Mulai Sekarang" → redirects to login
- [ ] Login dengan siswa@nera.demo works
- [ ] Dashboard student loads
- [ ] Auth guard prevents direct access

### **Navigation**
- [ ] Logo click → back to landing
- [ ] Beranda button works
- [ ] Statistik button works
- [ ] Jurnal button works
- [ ] Hardware button works

### **Top Bar Icons**
- [ ] Notification bell → /notifications
- [ ] Settings gear → /settings
- [ ] Avatar → /profile
- [ ] All buttons responsive

### **Logout Flow**
- [ ] Click avatar → profile
- [ ] Click "Keluar Akun"
- [ ] Redirected to login
- [ ] Cannot access dashboard without login

### **Multi-Role Testing**
- [ ] Login as Student → correct dashboard
- [ ] Logout → login as Teacher → correct dashboard
- [ ] Logout → login as Admin → correct dashboard

---

## 🐛 Common Issues & Solutions

### **Issue 1: Langsung masuk tanpa login**
**Penyebab:** Demo mode di AuthContext  
**Solusi:** Sudah diperbaiki dengan auth guard di setiap dashboard

### **Issue 2: Button tidak bisa diklik**
**Penyebab:** Missing onClick handlers  
**Solusi:** Semua button sekarang punya onClick dengan router.push()

### **Issue 3: Settings/Notifications 404**
**Penyebab:** Page belum dibuat  
**Solusi:** Sudah dibuat `/app/settings/page.tsx` dan `/app/notifications/page.tsx`

---

## 🎯 Next Steps

1. ✅ Login flow dengan auth guard
2. ✅ Functional buttons (logo, settings, notif, avatar)
3. ✅ Settings page
4. ✅ Notifications page
5. 🔄 Backend integration untuk notifications real-time
6. 🔄 Settings persistence (save user preferences)
7. 🔄 Profile edit functionality

---

## 📞 Quick Reference

**Login:**
- URL: `http://localhost:3000/auth/login`
- Demo: `siswa@nera.demo` / `Demo1234!`

**Dashboard:**
- Student: `/dashboard/student`
- Teacher: `/dashboard/teacher`
- Admin: `/dashboard/admin`

**Settings:** `/settings`  
**Notifications:** `/notifications`  
**Logout:** Dari settings atau profile page

---

**Status**: ✅ Ready for Testing  
**Deployment**: Push to Vercel untuk public testing

