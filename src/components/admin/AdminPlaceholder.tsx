import React from 'react';
import { Card } from '../ui/card';
import { LucideIcon } from 'lucide-react';

interface AdminPlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  comingSoon?: boolean;
}

export default function AdminPlaceholder({ 
  title, 
  description, 
  icon: Icon,
  comingSoon = true 
}: AdminPlaceholderProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-zinc-100 mb-2">{title}</h1>
        <p className="text-zinc-400">{description}</p>
      </div>

      {/* Placeholder Card */}
      <Card className="bg-zinc-800 border-zinc-700">
        <div className="p-12 text-center">
          <div className="w-20 h-20 bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon className="w-10 h-10 text-stone-400" />
          </div>
          
          {comingSoon ? (
            <>
              <h3 className="text-2xl text-zinc-100 mb-3">Binnenkort Beschikbaar</h3>
              <p className="text-zinc-400 max-w-md mx-auto">
                Deze functionaliteit is nog in ontwikkeling en wordt binnenkort toegevoegd aan het admin dashboard.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-2xl text-zinc-100 mb-3">Geen Data</h3>
              <p className="text-zinc-400 max-w-md mx-auto">
                Er zijn nog geen items om weer te geven.
              </p>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
