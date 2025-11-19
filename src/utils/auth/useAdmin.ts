import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { adminApi } from './adminApi';

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const adminStatus = await adminApi.isAdmin(user.id);
        if (mounted) {
          setIsAdmin(adminStatus);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        if (mounted) {
          setIsAdmin(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (!authLoading) {
      checkAdminStatus();
    }

    return () => {
      mounted = false;
    };
  }, [user, authLoading]);

  return {
    isAdmin,
    loading: authLoading || loading,
    user,
  };
}
