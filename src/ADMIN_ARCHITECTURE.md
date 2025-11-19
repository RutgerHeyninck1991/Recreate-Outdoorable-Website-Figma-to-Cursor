# 🏗️ Admin Dashboard - Technical Architecture

## 📁 File Structure

```
/
├── App.tsx                                 # Updated with admin routes
│
├── components/
│   ├── admin/                              # 🆕 Admin dashboard components
│   │   ├── AdminLayout.tsx                 # Dark theme sidebar + header layout
│   │   ├── AdminDashboard.tsx              # Dashboard home with stats & charts
│   │   ├── AdminFabrics.tsx                # Fabric management (migrated from FabricManager)
│   │   ├── AdminPlaceholder.tsx            # Reusable placeholder for coming soon pages
│   │   ├── AdminSetupHelper.tsx            # First-time admin setup UI
│   │   └── ProtectedAdminRoute.tsx         # Route protection HOC
│   │
│   ├── FabricManager.tsx                   # Legacy (kept for reference)
│   ├── Homepage.tsx
│   ├── Login.tsx
│   └── ... (other components)
│
├── utils/
│   ├── auth/                               # 🆕 Authentication & authorization
│   │   ├── adminApi.ts                     # Admin API client
│   │   ├── useAuth.ts                      # Authentication hook
│   │   └── useAdmin.ts                     # Admin role check hook
│   │
│   ├── fabricApi.ts                        # Updated with cleanupDefaultFabrics()
│   └── supabase/
│       └── info.tsx                        # Updated with supabase client export
│
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx                   # Updated with admin endpoints
│           └── kv_store.tsx
│
└── docs/                                   # 🆕 Documentation
    ├── ADMIN_QUICKSTART.md                 # Quick start guide
    ├── ADMIN_SETUP.md                      # Detailed setup instructions
    ├── ADMIN_ARCHITECTURE.md               # This file - technical overview
    ├── CLEANUP_INSTRUCTIONS.md             # Fabric cleanup guide
    ├── PBR_TEXTURE_GUIDE.md
    └── SUBSTANCE_EXPORT_GUIDE.md
```

---

## 🔐 Authentication Flow

```
User visits /admin
    ↓
ProtectedAdminRoute component
    ↓
useAdmin() hook
    ↓
useAuth() hook → Get current user from Supabase
    ↓
adminApi.isAdmin(userId) → Check role in KV store
    ↓
    ├─ ✅ Is Admin → Render admin dashboard
    ├─ ❌ Not Admin → Show "Access Denied"
    └─ 🔓 Not Logged In → Redirect to /login
```

---

## 💾 Data Schema (KV Store)

### User Roles
```typescript
Key: `user:${userId}:role`
Value: 'admin' | 'customer'

Example:
user:abc123:role → 'admin'
```

### Admin Users List
```typescript
Key: `admin:users`
Value: string[] (array of user IDs)

Example:
admin:users → ['abc123', 'def456']
```

### Email to User ID Mapping
```typescript
Key: `admin:email:${email}`
Value: userId (string)

Example:
admin:email:owner@outdoorable.com → 'abc123'
```

### Fabrics (Existing)
```typescript
Key: `fabric:${fabricId}`
Value: Fabric object

Example:
fabric:fontelina-180-beige → {
  id: 'fontelina-180-beige',
  name: 'Fontelina 180 Beige',
  category: 'sunproof',
  textureUrl: 'https://...',
  normalMapUrl: 'https://...',
  roughnessMapUrl: 'https://...',
  aoMapUrl: 'https://...',
  // ... other properties
}
```

---

## 🌐 API Endpoints

### Admin Role Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/check/:userId` | Check if user is admin |
| GET | `/admin/role/:userId` | Get user role |
| POST | `/admin/set-role` | Set user as admin |
| POST | `/admin/remove-role` | Remove admin role |
| GET | `/admin/list` | List all admins |
| POST | `/admin/initialize` | First-time admin setup |

### Fabric Management (Existing)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/fabrics` | Get all fabrics |
| POST | `/fabrics` | Create fabric |
| PUT | `/fabrics/:id` | Update fabric |
| DELETE | `/fabrics/:id` | Delete fabric |
| POST | `/fabrics/sync-storage` | Sync from Supabase Storage |
| POST | `/fabrics/cleanup-defaults` | Remove default fabrics |

---

## 🎨 Design System

### Color Tokens (Dark Theme)

```css
/* Backgrounds */
--bg-primary: #09090b;      /* zinc-950 */
--bg-secondary: #18181b;    /* zinc-900 */
--bg-card: #27272a;         /* zinc-800 */
--bg-elevated: #3f3f46;     /* zinc-700 */

/* Text */
--text-primary: #f4f4f5;    /* zinc-100 */
--text-secondary: #a1a1aa;  /* zinc-400 */
--text-muted: #71717a;      /* zinc-500 */

/* Borders */
--border-default: #3f3f46;  /* zinc-700 */
--border-subtle: #27272a;   /* zinc-800 */

/* Accent (Outdoorable Brand) */
--accent-primary: #57534e;  /* stone-600 */
--accent-hover: #44403c;    /* stone-700 */

/* Status */
--success: #22c55e;         /* green-500 */
--warning: #f59e0b;         /* amber-500 */
--error: #ef4444;           /* red-500 */
--info: #3b82f6;            /* blue-500 */
```

### Typography
```css
/* Headers */
h1: 30px (text-3xl)
h2: 24px (text-2xl)
h3: 18px (text-lg)

/* Body */
p: 14px (text-sm)
small: 12px (text-xs)

/* Font family: System default (inherited from globals.css) */
```

### Spacing
```css
/* Container padding */
Mobile: 24px (p-6)
Desktop: 32px (p-8)

/* Card padding */
Standard: 24px (p-6)
Compact: 16px (p-4)

/* Gap between elements */
Small: 12px (gap-3)
Medium: 16px (gap-4)
Large: 24px (gap-6)
```

---

## 🧩 Component Architecture

### AdminLayout
```tsx
<AdminLayout>
  ├── Sidebar (fixed left, 256px)
  │   ├── Logo
  │   ├── Navigation (7 items)
  │   ├── "Back to website" link
  │   └── User info + logout
  │
  └── Main Content
      ├── Mobile Header (hamburger menu)
      └── Page Content (children)
</AdminLayout>
```

### AdminDashboard
```tsx
<AdminDashboard>
  ├── Header
  ├── Stats Grid (4 cards)
  │   ├── Totale Omzet
  │   ├── Bestellingen
  │   ├── Actieve Klanten
  │   └── Stoffen in Catalog
  ├── Charts Row (2 charts)
  │   ├── Bestellingen Bar Chart
  │   └── Omzet Line Chart
  ├── Recent Orders Table
  └── Quick Actions Grid
</AdminDashboard>
```

### AdminFabrics
```tsx
<AdminFabrics>
  ├── Header
  ├── Actions Card
  │   ├── "Sync vanuit Storage"
  │   ├── "Init Default Fabrics"
  │   └── "Verwijder Default Fabrics"
  ├── Status Message (conditional)
  ├── Storage Info (conditional)
  └── Fabrics Grid
      └── Fabric Cards (3 columns)
          ├── Preview Image
          ├── Name & ID
          ├── Badges (category, waterproof, UV)
          ├── PBR Maps Status
          ├── Price
          └── Delete Button
</AdminFabrics>
```

### ProtectedAdminRoute
```tsx
<ProtectedAdminRoute>
  ├── Loading State → Loader spinner
  ├── Not Logged In → Redirect to /login
  ├── Not Admin → Access Denied page
  └── Is Admin → Render children ✅
</ProtectedAdminRoute>
```

---

## 🔄 State Management

### Custom Hooks

**useAuth()**
```typescript
Returns:
- user: User | null
- loading: boolean
- isAuthenticated: boolean
- signOut: () => Promise<void>

Usage:
const { user, loading, signOut } = useAuth();
```

**useAdmin()**
```typescript
Returns:
- isAdmin: boolean
- loading: boolean
- user: User | null

Usage:
const { isAdmin, loading } = useAdmin();
```

**useFabrics()** (Existing)
```typescript
Returns:
- fabrics: Fabric[]
- loading: boolean
- error: string | null

Usage:
const { fabrics, loading } = useFabrics();
```

---

## 📊 Charts (Recharts)

### Bar Chart (Orders)
```tsx
<BarChart data={salesData}>
  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
  <XAxis dataKey="name" stroke="#a1a1aa" />
  <YAxis stroke="#a1a1aa" />
  <Tooltip />
  <Bar dataKey="orders" fill="#78716c" />
</BarChart>
```

### Line Chart (Revenue)
```tsx
<LineChart data={salesData}>
  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
  <XAxis dataKey="name" stroke="#a1a1aa" />
  <YAxis stroke="#a1a1aa" />
  <Tooltip />
  <Line type="monotone" dataKey="revenue" stroke="#78716c" />
</LineChart>
```

---

## 🚀 Performance Optimizations

### 1. Route-based Code Splitting
Admin routes are lazy loaded via React Router

### 2. Memoization
- Fabric list is memoized in useFabrics hook
- Chart data is computed once

### 3. Caching
- fabricApi uses in-memory cache (30s TTL)
- Admin role checks are cached per user session

### 4. Conditional Rendering
- Sidebar only renders active/needed components
- Charts only load when dashboard is visible

---

## 🔒 Security Considerations

### Current Implementation
✅ Role-based access control (admin/customer)
✅ Protected routes with redirect
✅ Server-side role verification
✅ Supabase authentication
✅ KV store for role persistence

### Future Enhancements
🔄 Permissions per admin (granular control)
🔄 Audit logging (who did what when)
🔄 Session timeout
🔄 2FA support
🔄 IP whitelisting for admin routes

---

## 📈 Scalability

### Current Capacity
- ✅ Multiple admin users supported
- ✅ Hundreds of fabrics
- ✅ KV store backed by Supabase (scales automatically)

### Future Scaling
When you need to scale:
1. **Orders**: Use Supabase PostgreSQL tables instead of KV
2. **Analytics**: Pre-compute stats daily
3. **Images**: Use CDN for fabric textures
4. **Search**: Add search index for fabrics/customers

---

## 🧪 Testing Checklist

### Manual Testing (Week 1)
- [ ] Login as non-admin → Should not access /admin
- [ ] Login as admin → Should access all admin routes
- [ ] Test sidebar navigation (all 7 pages)
- [ ] Test mobile responsive (sidebar collapse)
- [ ] Sync fabrics from Storage
- [ ] Delete a fabric
- [ ] Cleanup default fabrics
- [ ] Logout from admin dashboard
- [ ] Test "Back to website" link

### Automated Testing (Future)
- [ ] Unit tests for hooks (useAuth, useAdmin)
- [ ] Integration tests for admin API
- [ ] E2E tests for admin workflow
- [ ] Performance tests for large fabric lists

---

## 📚 Dependencies

### New Dependencies (Week 1)
```json
{
  "recharts": "^2.x",           // Charts
  "@supabase/supabase-js": "^2.x" // Auth & storage
}
```

### Existing Dependencies
```json
{
  "react-router-dom": "^6.x",   // Routing
  "lucide-react": "^0.x",       // Icons
  "tailwindcss": "^4.x",        // Styling
  "motion/react": "^11.x"       // Animations
}
```

---

## 🎯 Future Roadmap

### Week 2: Order System
- [ ] Cart functionality
- [ ] Checkout flow
- [ ] Payment integration (Stripe/Mollie)
- [ ] Order management UI
- [ ] Email notifications (Resend/SendGrid)
- [ ] Invoice generation

### Week 3: Content & Analytics
- [ ] WYSIWYG editor (TipTap/Lexical)
- [ ] Image upload & management
- [ ] Real-time analytics
- [ ] Export to CSV/PDF
- [ ] SEO settings

### Week 4: Advanced Features
- [ ] Multi-language support (i18n)
- [ ] Theme customization
- [ ] Advanced permissions
- [ ] Backup & restore
- [ ] Activity logs

---

## 💡 Best Practices

### Code Organization
- ✅ Separate admin components from public components
- ✅ Use custom hooks for shared logic
- ✅ Keep API logic in dedicated files
- ✅ Document complex functions

### Security
- ✅ Always verify admin role server-side
- ✅ Never trust client-side checks
- ✅ Sanitize user inputs
- ✅ Use environment variables for secrets

### Performance
- ✅ Lazy load admin routes
- ✅ Cache API responses
- ✅ Optimize images
- ✅ Minimize re-renders

### UX
- ✅ Show loading states
- ✅ Provide feedback on actions
- ✅ Handle errors gracefully
- ✅ Make mobile-friendly

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Recharts Docs**: https://recharts.org/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Router**: https://reactrouter.com/

---

**Architecture complete!** 🏗️  
Built with scalability, security, and developer experience in mind.
