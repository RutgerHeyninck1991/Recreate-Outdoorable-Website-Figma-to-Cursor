import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Package,
  ArrowUp,
  ArrowDown,
  Loader2
} from 'lucide-react';
import { fabricApi } from '../../utils/fabricApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}

function StatCard({ title, value, change, icon: Icon, loading }: StatCardProps) {
  const isPositive = change && change > 0;
  
  return (
    <Card className="bg-zinc-800 border-zinc-700 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm text-zinc-400">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-zinc-700 animate-pulse rounded" />
          ) : (
            <p className="text-3xl text-zinc-100">{value}</p>
          )}
          {change !== undefined && !loading && (
            <div className="flex items-center space-x-1">
              {isPositive ? (
                <ArrowUp className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-zinc-500">vs vorige maand</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-stone-400" />
        </div>
      </div>
    </Card>
  );
}

// Mock data for charts (replace with real data later)
const salesData = [
  { name: 'Ma', orders: 12, revenue: 2400 },
  { name: 'Di', orders: 19, revenue: 3800 },
  { name: 'Wo', orders: 8, revenue: 1600 },
  { name: 'Do', orders: 15, revenue: 3000 },
  { name: 'Vr', orders: 22, revenue: 4400 },
  { name: 'Za', orders: 28, revenue: 5600 },
  { name: 'Zo', orders: 18, revenue: 3600 },
];

export default function AdminDashboard() {
  const [fabricCount, setFabricCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const fabrics = await fabricApi.getFabrics();
      setFabricCount(fabrics.length);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-zinc-100 mb-2">Dashboard</h1>
        <p className="text-zinc-400">
          Welkom terug! Hier is een overzicht van je Outdoorable business.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Totale Omzet"
          value="€12,450"
          change={12.5}
          icon={TrendingUp}
          loading={loading}
        />
        <StatCard
          title="Bestellingen"
          value="45"
          change={8.2}
          icon={ShoppingCart}
          loading={loading}
        />
        <StatCard
          title="Actieve Klanten"
          value="28"
          change={-3.1}
          icon={Users}
          loading={loading}
        />
        <StatCard
          title="Stoffen in Catalog"
          value={fabricCount}
          icon={Package}
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <Card className="bg-zinc-800 border-zinc-700 p-6">
          <h3 className="text-lg text-zinc-100 mb-4">Bestellingen deze week</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis dataKey="name" stroke="#a1a1aa" />
              <YAxis stroke="#a1a1aa" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#27272a', 
                  border: '1px solid #3f3f46',
                  borderRadius: '8px',
                  color: '#e4e4e7'
                }}
              />
              <Bar dataKey="orders" fill="#78716c" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue Chart */}
        <Card className="bg-zinc-800 border-zinc-700 p-6">
          <h3 className="text-lg text-zinc-100 mb-4">Omzet deze week</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis dataKey="name" stroke="#a1a1aa" />
              <YAxis stroke="#a1a1aa" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#27272a', 
                  border: '1px solid #3f3f46',
                  borderRadius: '8px',
                  color: '#e4e4e7'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#78716c" 
                strokeWidth={3}
                dot={{ fill: '#78716c', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-zinc-800 border-zinc-700">
        <div className="p-6 border-b border-zinc-700">
          <h3 className="text-lg text-zinc-100">Recente Bestellingen</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-12 text-zinc-500">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nog geen bestellingen</p>
            <p className="text-sm mt-2">Order systeem komt binnenkort beschikbaar</p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-zinc-800 border-zinc-700 p-6">
        <h3 className="text-lg text-zinc-100 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/fabrics"
            className="p-4 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors text-center space-y-2"
          >
            <Package className="w-8 h-8 text-stone-400 mx-auto" />
            <p className="text-zinc-100">Stoffen Beheren</p>
          </a>
          <button
            className="p-4 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors text-center space-y-2"
            disabled
          >
            <ShoppingCart className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-zinc-500">Nieuwe Bestelling</p>
            <p className="text-xs text-zinc-600">Binnenkort</p>
          </button>
          <button
            className="p-4 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors text-center space-y-2"
            disabled
          >
            <Users className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-zinc-500">Klant Toevoegen</p>
            <p className="text-xs text-zinc-600">Binnenkort</p>
          </button>
        </div>
      </Card>
    </div>
  );
}
