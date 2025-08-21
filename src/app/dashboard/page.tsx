'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types'; // Importiamo i tipi del database

// Definiamo un tipo "Meal" per semplicità, basato sulla nostra tabella del database
type Meal = Database['public']['Tables']['meals']['Row'];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [newMeal, setNewMeal] = useState({ name: '', calories: 0, protein: 0, carbs: 0, fats: 0 });
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  // Creiamo un client Supabase specifico per i componenti client
  const supabase = createClientComponentClient<Database>();

  // Funzione per caricare i pasti dell'utente loggato
  const fetchMeals = async (userId: string) => {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching meals:', error);
    } else {
      setMeals(data);
    }
  };

  // Al caricamento della pagina, controlla l'utente e carica i suoi pasti
  useEffect(() => {
    const checkUserAndFetchMeals = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        await fetchMeals(user.id);
        setLoading(false);
      }
    };
    checkUserAndFetchMeals();
  }, [router, supabase]);

  // Gestisce il cambiamento dei valori nel modulo di inserimento
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Converte in numero se il campo non è "name"
    setNewMeal(prev => ({ ...prev, [name]: name === 'name' ? value : Number(value) }));
  };

  // Gestisce l'invio del modulo per aggiungere un nuovo pasto
  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMeal.name || newMeal.calories <= 0) {
      alert('Per favore, inserisci almeno il nome e le calorie del pasto.');
      return;
    }

    // Inserisce il nuovo pasto nel database
    const { data, error } = await supabase
      .from('meals')
      .insert([{ ...newMeal, user_id: user.id }])
      .select()
      .single();

    if (error) {
      alert('Errore nell\'aggiungere il pasto: ' + error.message);
    } else if (data) {
      // Aggiorna la lista dei pasti nell'interfaccia senza ricaricare la pagina
      setMeals([data, ...meals]);
      // Svuota il modulo
      setNewMeal({ name: '', calories: 0, protein: 0, carbs: 0, fats: 0 });
    }
  };

  // Mostra un messaggio di caricamento mentre verifichiamo l'utente e carichiamo i dati
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><p>Caricamento...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">La Tua Dashboard</h1>
        
        {/* Modulo per aggiungere un pasto */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800">Aggiungi un nuovo pasto</h2>
          <form onSubmit={handleAddMeal} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <input name="name" value={newMeal.name} onChange={handleInputChange} placeholder="Nome (es. Mela)" className="lg:col-span-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required />
            <input name="calories" type="number" value={newMeal.calories || ''} onChange={handleInputChange} placeholder="Calorie" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required />
            <input name="protein" type="number" value={newMeal.protein || ''} onChange={handleInputChange} placeholder="Proteine (g)" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            <input name="carbs" type="number" value={newMeal.carbs || ''} onChange={handleInputChange} placeholder="Carboidrati (g)" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            <input name="fats" type="number" value={newMeal.fats || ''} onChange={handleInputChange} placeholder="Grassi (g)" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            <button type="submit" className="sm:col-span-2 lg:col-span-5 w-full rounded-md bg-indigo-600 px-4 py-2 text-white font-semibold shadow-sm hover:bg-indigo-500">Aggiungi Pasto</button>
          </form>
        </div>

        {/* Lista dei pasti */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800">Pasti di Oggi</h2>
          <div className="mt-4 space-y-4">
            {meals.length > 0 ? (
              meals.map((meal) => (
                <div key={meal.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800">{meal.name}</p>
                    <p className="text-sm text-gray-500">
                      {meal.calories} kcal &bull; P: {meal.protein}g &bull; C: {meal.carbs}g &bull; F: {meal.fats}g
                    </p>
                  </div>
                  {/* In futuro qui potremmo aggiungere un pulsante per eliminare il pasto */}
                </div>
              ))
            ) : (
              <div className="bg-white p-4 rounded-lg shadow-sm text-center text-gray-500">
                <p>Nessun pasto registrato. Inizia aggiungendone uno dal modulo qui sopra!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}