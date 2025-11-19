import { projectId, publicAnonKey } from '../supabase/info';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'customer';
  permissions?: string[];
  createdAt: string;
}

class AdminAPI {
  private baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-ecff565c`;

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Request failed');
    }

    return response;
  }

  // Check if user is admin
  async isAdmin(userId: string): Promise<boolean> {
    try {
      const response = await this.makeRequest(`/admin/check/${userId}`);
      const data = await response.json();
      return data.isAdmin || false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  // Get user role
  async getUserRole(userId: string): Promise<'admin' | 'customer'> {
    try {
      const response = await this.makeRequest(`/admin/role/${userId}`);
      const data = await response.json();
      return data.role || 'customer';
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'customer';
    }
  }

  // Set user as admin (requires admin permissions)
  async setAdminRole(userId: string, email: string): Promise<void> {
    await this.makeRequest('/admin/set-role', {
      method: 'POST',
      body: JSON.stringify({ userId, email, role: 'admin' }),
    });
  }

  // Remove admin role
  async removeAdminRole(userId: string): Promise<void> {
    await this.makeRequest('/admin/remove-role', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  // List all admins
  async listAdmins(): Promise<AdminUser[]> {
    try {
      const response = await this.makeRequest('/admin/list');
      const data = await response.json();
      return data.admins || [];
    } catch (error) {
      console.error('Error listing admins:', error);
      return [];
    }
  }

  // Initialize first admin (by email)
  async initializeAdmin(email: string): Promise<void> {
    await this.makeRequest('/admin/initialize', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }
}

export const adminApi = new AdminAPI();
