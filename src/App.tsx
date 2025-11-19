import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './components/Homepage';
import CushionWizard from './components/CushionWizard';
import CushionConfigurator from './components/CushionConfigurator';
import Login from './components/Login';
import Profile from './components/Profile';
import FabricManager from './components/FabricManager';

// Admin components
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminFabrics from './components/admin/AdminFabrics';
import AdminPlaceholder from './components/admin/AdminPlaceholder';
import AdminSetupHelper from './components/admin/AdminSetupHelper';
import { ShoppingCart, Users, BarChart3, FileText, Settings } from 'lucide-react';

// Dev navigation helper (REMOVE IN PRODUCTION)
import DevQuickNav from './components/DevQuickNav';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        {/* DEV ONLY: Quick navigation floating button */}
        <DevQuickNav />
        
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/kussen-wizard" element={<CushionWizard />} />
          <Route path="/configurator" element={<CushionConfigurator />} />
          <Route path="/configurator/:cushionType" element={<CushionConfigurator />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Legacy fabric manager (redirect to admin) */}
          <Route path="/fabric-manager" element={<Navigate to="/admin/fabrics" replace />} />
          
          {/* TEMPORARY: Admin setup helper - REMOVE AFTER FIRST ADMIN IS SETUP */}
          <Route path="/admin-setup" element={<AdminSetupHelper />} />
          
          {/* Admin routes - protected */}
          <Route path="/admin" element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedAdminRoute>
          } />
          
          <Route path="/admin/fabrics" element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <AdminFabrics />
              </AdminLayout>
            </ProtectedAdminRoute>
          } />
          
          <Route path="/admin/orders" element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <AdminPlaceholder 
                  title="Bestellingen"
                  description="Beheer en bekijk alle bestellingen"
                  icon={ShoppingCart}
                />
              </AdminLayout>
            </ProtectedAdminRoute>
          } />
          
          <Route path="/admin/customers" element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <AdminPlaceholder 
                  title="Klanten"
                  description="Beheer klantaccounts en gegevens"
                  icon={Users}
                />
              </AdminLayout>
            </ProtectedAdminRoute>
          } />
          
          <Route path="/admin/analytics" element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <AdminPlaceholder 
                  title="Analytics"
                  description="Verkoop statistieken en rapportages"
                  icon={BarChart3}
                />
              </AdminLayout>
            </ProtectedAdminRoute>
          } />
          
          <Route path="/admin/content" element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <AdminPlaceholder 
                  title="Content Beheer"
                  description="Bewerk website content en afbeeldingen"
                  icon={FileText}
                />
              </AdminLayout>
            </ProtectedAdminRoute>
          } />
          
          <Route path="/admin/settings" element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <AdminPlaceholder 
                  title="Instellingen"
                  description="Website configuratie en admin beheer"
                  icon={Settings}
                />
              </AdminLayout>
            </ProtectedAdminRoute>
          } />
          
          {/* Catch-all route to redirect unknown paths to homepage */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}