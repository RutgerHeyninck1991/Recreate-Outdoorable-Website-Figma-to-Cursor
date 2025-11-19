# 🚀 Admin Dashboard - Quick Start

## ✨ Week 1 is Live!

Je hebt nu een volledig werkend **dark theme admin dashboard** met:
- ✅ Dashboard met statistieken
- ✅ Stoffen beheer (vanuit Supabase Storage)
- ✅ Role-based beveiliging
- ✅ Responsive sidebar (mobile & desktop)
- ✅ Placeholder pages voor toekomstige features

---

## 📋 Eerste Keer Setup (5 minuten)

### Stap 1: Login op je website
```
Ga naar: /login
Log in met je Supabase account
```

### Stap 2: Maak jezelf admin
```
Ga naar: /admin-setup
Klik: "Maak mij Admin"
Wacht op bevestiging
```

### Stap 3: Ga naar admin dashboard
```
Ga naar: /admin
Je zou nu het dashboard moeten zien! 🎉
```

### Stap 4: Test stoffen beheer
```
Klik: "Stoffen" in de sidebar
Klik: "Sync vanuit Storage"
Check of je stoffen geladen worden
```

---

## 🎯 Admin Dashboard URLs

```bash
/admin              # Dashboard home (stats)
/admin/fabrics      # Stoffen beheer ✅
/admin/orders       # Bestellingen (coming soon)
/admin/customers    # Klanten (coming soon)
/admin/analytics    # Analytics (coming soon)
/admin/content      # Content editor (coming soon)
/admin/settings     # Instellingen (coming soon)
```

---

## 🔐 Security Checklist

Na eerste setup:

- [ ] Check of je toegang hebt tot `/admin`
- [ ] Test of een niet-admin account **geen** toegang heeft
- [ ] **VERWIJDER** de `/admin-setup` route uit `App.tsx` (veiligheid!)
- [ ] Bewaar je admin login credentials veilig

### Route Verwijderen:
Open `/App.tsx` en verwijder deze regel:
```tsx
<Route path="/admin-setup" element={<AdminSetupHelper />} />
```

---

## 📱 Mobile & Desktop

### Desktop
- Sidebar altijd zichtbaar (links)
- 256px breed
- Hover effecten op menu items

### Mobile
- Sidebar verborgen by default
- Hamburger menu (☰) linksboven
- Swipe/click om te openen
- Backdrop overlay

---

## 🎨 Features Week 1

### ✅ Dashboard Home
- Omzet card (mock data)
- Orders card (mock data)
- Klanten card (mock data)
- Stoffen count (real data!)
- Bar chart (bestellingen per dag)
- Line chart (omzet)
- Recent orders lijst
- Quick actions

### ✅ Stoffen Beheer
- Sync vanuit Supabase Storage
- Automatische PBR texture detectie
- Visual fabric grid
- Delete functionaliteit
- Storage bucket info
- Error handling
- Status messages

### ✅ Sidebar
- Logo + branding
- Navigatie met icons
- Active state highlighting
- Badge voor notifications (orders)
- "Terug naar website" link
- User info met avatar
- Logout button
- Responsive collapse

---

## 🔄 Workflow

### Stoffen Toevoegen
1. Upload afbeeldingen naar Supabase Storage bucket "SUNPROOF SELECTIE"
2. Ga naar `/admin/fabrics`
3. Klik "Sync vanuit Storage"
4. Stoffen worden automatisch geïmporteerd met PBR maps

### Tweede Admin Toevoegen (Later)
```typescript
// Via browser console:
await adminApi.setAdminRole('USER_ID', 'email@example.com');
```

---

## 🐛 Troubleshooting

### Kan niet bij /admin
➜ Check of je admin setup hebt gedaan via `/admin-setup`

### "Access Denied" op /admin
➜ Logout en login opnieuw, run setup opnieuw

### Sidebar niet zichtbaar (mobile)
➜ Klik het hamburger menu (☰) linksboven

### Stoffen sync werkt niet
➜ Check Supabase Storage bucket bestaat en public is
➜ Check console (F12) voor errors

### Stats kloppen niet
➜ Normal! Dit is Week 1 - stats zijn mock data
➜ Echte data komt bij order systeem (Week 2)

---

## 📊 Mock vs Real Data

### 🟢 Real Data (Week 1)
- ✅ Aantal stoffen in catalog
- ✅ Stoffen lijst met details
- ✅ Storage bucket info

### 🟡 Mock Data (Placeholder)
- ⏳ Totale omzet
- ⏳ Aantal orders
- ⏳ Actieve klanten  
- ⏳ Grafieken
- ⏳ Recent orders

Deze worden **real** in Week 2 wanneer we het order systeem bouwen!

---

## 🚀 What's Next?

### Klaar voor gebruik nu:
- ✅ Login als admin
- ✅ Bekijk dashboard
- ✅ Beheer stoffen
- ✅ Test responsive design

### Coming in Week 2:
- 🔄 Order systeem (checkout flow)
- 🔄 Order beheer interface
- 🔄 Real analytics data
- 🔄 Email notificaties

### Coming in Week 3:
- 🔄 Content editor (homepage teksten)
- 🔄 Afbeeldingen beheer
- 🔄 SEO instellingen
- 🔄 Export functionaliteit

---

## 💡 Pro Tips

1. **Dark theme overal**: Het admin dashboard gebruikt volledig dark theme voor minder oogvermoeidheid bij lang werken

2. **Keyboard shortcuts**: Gebruik Tab om door navigatie te bewegen

3. **Mobile first**: Test altijd op mobile - sidebar werkt perfect responsive

4. **Storage bucket**: Houd "SUNPROOF SELECTIE" bucket georganiseerd - gebruik subdirectories voor verschillende collecties

5. **Backup**: Supabase heeft automatische backups, maar export je belangrijke data regelmatig

---

## 📞 Support

Check deze bestanden voor meer info:
- `/ADMIN_SETUP.md` - Uitgebreide setup guide
- `/CLEANUP_INSTRUCTIONS.md` - Stoffen beheer details
- `/PBR_TEXTURE_GUIDE.md` - PBR texture systeem
- `/SUBSTANCE_EXPORT_GUIDE.md` - Adobe Substance workflow

---

**Je bent klaar om te beginnen!** 🎉

Login → Setup → Dashboard → Stoffen Beheer → Done! ✨
