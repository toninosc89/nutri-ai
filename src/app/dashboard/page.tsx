'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/auth-helpers-nextjs';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Se non c'è l'utente, reindirizza alla pagina di login
        router.push('/login');
      } else {
        setUser(user);
        setLoading(false);
      }
    };
    checkUser();
  }, [router, supabase]);

  if (loading) {
    // Mostra un caricamento o nulla mentre si viene reindirizzati
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900">
          La Tua Dashboard, {user?.email}
        </h1>
        <p className="mt-2 text-gray-600">
          Qui potrai aggiungere e visualizzare i tuoi pasti.
        </p>
        {/* Il modulo per aggiungere i pasti e la lista verranno qui nella prossima fase */}
      </div>
    </div>
  );
}