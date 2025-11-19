import React, { useState } from 'react';
import { useAuth } from '../../utils/auth/useAuth';
import { adminApi } from '../../utils/auth/adminApi';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Shield, Loader2 } from 'lucide-react';

export default function AdminSetupHelper() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSetAdmin = async () => {
    if (!user) {
      setMessage('Je moet eerst inloggen!');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await adminApi.setAdminRole(user.id, user.email || '');
      setMessage('✅ Succesvol! Je bent nu admin. Redirect over 2 seconden...');
      setTimeout(() => {
        window.location.href = '/admin';
      }, 2000);
    } catch (error: any) {
      setMessage(`❌ Fout: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <Card className="bg-zinc-900 border-zinc-800 p-8 max-w-md w-full text-center space-y-4">
          <Shield className="w-16 h-16 text-stone-400 mx-auto" />
          <h1 className="text-2xl text-zinc-100">Admin Setup</h1>
          <p className="text-zinc-400">Je moet eerst inloggen om jezelf als admin in te stellen.</p>
          <a href="/login" className="inline-block mt-4">
            <Button className="bg-stone-600 hover:bg-stone-700">
              Naar Login
            </Button>
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <Card className="bg-zinc-900 border-zinc-800 p-8 max-w-md w-full space-y-6">
        <div className="text-center">
          <Shield className="w-16 h-16 text-stone-400 mx-auto mb-4" />
          <h1 className="text-2xl text-zinc-100 mb-2">Admin Setup</h1>
          <p className="text-zinc-400">Maak jezelf administrator van het Outdoorable dashboard.</p>
        </div>

        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-2">
          <p className="text-sm text-zinc-400">Ingelogd als:</p>
          <p className="text-zinc-100">{user.email}</p>
        </div>

        <Button 
          onClick={handleSetAdmin} 
          disabled={loading}
          className="w-full bg-stone-600 hover:bg-stone-700"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Bezig...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Maak mij Admin
            </>
          )}
        </Button>

        {message && (
          <div className={`p-4 rounded-lg text-center ${
            message.startsWith('✅') 
              ? 'bg-green-950/20 border border-green-800 text-green-400' 
              : 'bg-red-950/20 border border-red-800 text-red-400'
          }`}>
            {message}
          </div>
        )}

        <div className="pt-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 text-center">
            ⚠️ Deze pagina is alleen bedoeld voor eerste keer setup.
            <br />
            Verwijder de route na gebruik voor veiligheid.
          </p>
        </div>
      </Card>
    </div>
  );
}
