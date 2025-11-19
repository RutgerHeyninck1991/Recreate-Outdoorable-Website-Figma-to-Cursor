import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Settings, 
  LogIn, 
  User, 
  Palette,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  FileText,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DevQuickNav() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Homepage', href: '/', icon: Home },
    { name: 'Login', href: '/login', icon: LogIn },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Configurator', href: '/configurator', icon: Settings },
    { name: '─────── ADMIN ───────', href: null, icon: null, divider: true },
    { name: 'Admin Setup', href: '/admin-setup', icon: Shield, badge: 'Setup' },
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Stoffen', href: '/admin/fabrics', icon: Package },
    { name: 'Bestellingen', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Klanten', href: '/admin/customers', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Content', href: '/admin/content', icon: FileText },
    { name: 'Instellingen', href: '/admin/settings', icon: Settings },
  ];

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Dev Quick Nav"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </motion.button>

      {/* Navigation Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-zinc-900 shadow-2xl z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-br from-purple-600 to-blue-600 text-white p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold">Dev Quick Nav</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-white/80 text-xs">
                  Snelkoppelingen voor ontwikkeling
                </p>
              </div>

              {/* Navigation Items */}
              <nav className="p-4 space-y-1">
                {navItems.map((item, index) => {
                  if (item.divider) {
                    return (
                      <div key={index} className="py-3 text-center text-zinc-500 text-xs font-semibold tracking-wider">
                        {item.name}
                      </div>
                    );
                  }

                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={index}
                      to={item.href!}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all group"
                    >
                      {Icon && <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="sticky bottom-0 bg-zinc-800 border-t border-zinc-700 p-4">
                <div className="text-xs text-zinc-500 space-y-1">
                  <p>💡 <strong>Tip:</strong> Verwijder dit component in productie!</p>
                  <p className="text-zinc-600">DevQuickNav.tsx</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
