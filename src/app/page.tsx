'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { User } from '@supabase/auth-helpers-nextjs';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    setUser(null);
  };

  // Se l'utente non è loggato, mostra il benvenuto e il pulsante Login
  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Benvenuto in Nutri-AI
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            La tua app per il tracciamento alimentare sta prendendo forma.
          </p>
          <div className="mt-10">
            <button
              onClick={() => router.push('/login')}
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Accedi o Registrati
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Se l'utente è loggato, mostra il benvenuto personalizzato e il pulsante Logout
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Ciao, {user.email}!
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Sei pronto per iniziare a tracciare i tuoi pasti?
        </p>
        <div className="mt-10">
          <button
            onClick={handleLogout}
            className="rounded-md bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}