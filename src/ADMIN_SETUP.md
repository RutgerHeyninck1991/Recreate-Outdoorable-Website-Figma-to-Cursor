# Admin Dashboard Setup Guide

## ✅ Week 1: Admin Infrastructure - Geïmplementeerd!

Het admin dashboard is nu live met:
- 🎨 **Dark theme** minimalistisch design
- 📱 **Responsive sidebar** (collapsible op mobile)
- 🔐 **Role-based access control**
- 📊 **Dashboard met statistieken**
- 📦 **Stoffen beheer** (gemigreerd van FabricManager)
- 🚧 **Placeholder pages** voor toekomstige features

---

## 🔐 Jezelf als Admin Instellen

### Optie 1: Via Browser Console (Makkelijkst)

1. **Login** op je website met je Supabase account
2. **Open Developer Tools** (F12)
3. **Ga naar Console tab**
4. **Plak en run dit script:**

```javascript
// Haal je user ID op
const user = (await (await fetch('https://iydxusrdnduybpnhozvi.supabase.co/auth/v1/user', {
  headers: {
    'Authorization': 'Bearer ' + (await (await import('https://esm.sh/@supabase/supabase-js@2')).createClient(
      'https://iydxusrdnduybpnhozvi.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5ZHh1c3JkbmR1eWJwbmhvenZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjMzNzIsImV4cCI6MjA3NzQ5OTM3Mn0.RbbivGBKsoZQFWUS1dLGtrqlpo-xEhhgtkkN4QBnQz0'
    )).auth.getSession()).data.session.access_token
  }
})).json());

// Maak jezelf admin
await fetch('https://iydxusrdnduybpnhozvi.supabase.co/functions/v1/make-server-ecff565c/admin/set-role', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5ZHh1c3JkbmR1eWJwbmhvenZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjMzNzIsImV4cCI6MjA3NzQ5OTM3Mn0.RbbivGBKsoZQFWUS1dLGtrqlpo-xEhhgtkkN4QBnQz0',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: user.id,
    email: user.email,
    role: 'admin'
  })
}).then(r => r.json()).then(console.log);

console.log('✅ Je bent nu admin! Refresh de pagina en ga naar /admin');
```

5. **Refresh de pagina**
6. **Ga naar** `/admin`

---

### Optie 2: Via React Component (Tijdelijk)

1. Maak een tijdelijk bestand `/components/AdminSetup.tsx`:

```tsx
import React, { useEffect } from 'react';
import { useAuth } from '../utils/auth/useAuth';
import { adminApi } from '../utils/auth/adminApi';
import { Button } from './ui/button';

export default function AdminSetup() {
  const { user } = useAuth();

  const handleSetAdmin = async () => {
    if (!user) {
      alert('Je moet ingelogd zijn!');
      return;
    }

    try {
      await adminApi.setAdminRole(user.id, user.email || '');
      alert('✅ Je bent nu admin! Ga naar /admin');
      window.location.href = '/admin';
    } catch (error: any) {
      alert('❌ Fout: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-3xl">Admin Setup</h1>
        {user ? (
          <div className="space-y-4">
            <p>Ingelogd als: {user.email}</p>
            <Button onClick={handleSetAdmin} className="w-full">
              Maak mij Admin
            </Button>
          </div>
        ) : (
          <p>Log eerst in op /login</p>
        )}
      </div>
    </div>
  );
}
```

2. Voeg route toe aan `App.tsx`:
```tsx
<Route path="/admin-setup" element={<AdminSetup />} />
```

3. Ga naar `/admin-setup` en klik de button
4. **Verwijder het bestand weer** na gebruik!

---

## 📂 Admin Dashboard Structuur

### Routes
```
/admin                → Dashboard home (statistieken)
/admin/fabrics        → Stoffen beheer
/admin/orders         → Bestellingen (placeholder)
/admin/customers      → Klanten (placeholder)
/admin/analytics      → Analytics (placeholder)
/admin/content        → Content editor (placeholder)
/admin/settings       → Instellingen (placeholder)
```

### Features Week 1 ✅
- Dark theme sidebar met Outdoorable branding
- Responsive (mobile hamburger menu)
- Protected routes (alleen admin toegang)
- Dashboard met statistieken cards
- Grafieken (recharts) voor orders/omzet
- Stoffen beheer (volledig werkend)
- Quick actions
- User info & logout in sidebar

---

## 🎨 Design Specs

### Color Palette (Dark Theme)
```css
Background:  zinc-950  (#09090b)
Cards:       zinc-800  (#27272a)
Sidebar:     zinc-900  (#18181b)
Borders:     zinc-700  (#3f3f46)
Text:        zinc-100  (#f4f4f5)
Muted:       zinc-400  (#a1a1aa)
Accent:      stone-600 (#57534e) - Outdoorable brand
```

### Components
- Sidebar: 256px breed, fixed left
- Content: Responsive padding (24px mobile, 32px desktop)
- Cards: Rounded-lg met subtle borders
- Charts: Recharts met dark theme styling

---

## 🔒 Security

### Role System
```typescript
// User roles opgeslagen in KV store:
`user:${userId}:role` → 'admin' | 'customer'

// Admin users lijst:
`admin:users` → ['user-id-1', 'user-id-2', ...]

// Email mapping (optioneel):
`admin:email:${email}` → userId
```

### Route Protection
- `ProtectedAdminRoute` component checkt admin status
- Redirect naar `/login` als niet ingelogd
- "Access Denied" pagina als geen admin
- Loading state tijdens check

---

## 📝 Database Schema (KV Store)

### Admin Related
```
user:{userId}:role              → 'admin' | 'customer'
admin:users                     → [userId1, userId2, ...]
admin:email:{email}             → userId
admin:setup:email               → email (first-time setup)
```

### Bestaande Schema
```
fabric:{fabricId}               → Fabric object
user:{userId}:designs           → User designs
user:{userId}:profile           → User profile
```

---

## 🚀 Volgende Stappen (Toekomstig)

### Week 2: Order Systeem
- [ ] Winkelwagen functionaliteit
- [ ] Checkout flow
- [ ] Order database schema
- [ ] Admin order beheer interface
- [ ] Email notificaties

### Week 3: Content & Analytics
- [ ] WYSIWYG content editor
- [ ] Afbeeldingen beheer
- [ ] Real-time analytics dashboard
- [ ] Export functionaliteit (CSV/PDF)

### Week 4: Advanced Features
- [ ] Multi-admin support (invite systeem)
- [ ] Permissions per admin
- [ ] Audit log (wie deed wat wanneer)
- [ ] Backup & restore

---

## 💡 Tips

### Admin Beheer
- Bewaar admin credentials veilig
- Gebruik sterke passwords
- Overweeg 2FA in de toekomst

### Testing
- Test admin functies altijd in een test account eerst
- Check mobile responsiveness
- Controleer permissions werken correct

### Meerdere Admins Toevoegen
```javascript
// Via console na admin setup:
await adminApi.setAdminRole('USER_ID_HERE', 'email@example.com');
```

---

## 🐛 Troubleshooting

### "Access Denied" terwijl ik admin zou moeten zijn
1. Check of je ingelogd bent
2. Run admin setup script opnieuw
3. Clear browser cache & cookies
4. Check browser console voor errors

### Sidebar niet zichtbaar op mobile
- Klik hamburger menu (☰) linksboven
- Sidebar schuift in van links

### Stats niet correct
- Dit is Week 1 - stats zijn nog mock data
- Echte data komt bij order systeem implementatie

---

## 📧 Support

Als je problemen hebt met de admin setup, check:
1. Browser console (F12) voor errors
2. Network tab voor failed requests
3. Supabase dashboard voor database status

---

**Klaar voor gebruik!** 🎉  
Login, run het admin setup script, en ga naar `/admin` om te beginnen!
