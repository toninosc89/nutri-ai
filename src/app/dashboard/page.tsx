'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import type { User } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';

type Meal = Database['public']['Tables']['meals']['Row'];
// Definiamo un tipo per il form, dove i valori numerici possono essere stringhe vuote
type NewMealForm = {
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [newMeal, setNewMeal] = useState<NewMealForm>({ name: '', calories: '', protein: '', carbs: '', fats: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const checkUserAndFetchMeals = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUser(user);
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching meals:', error);
        setError('Impossibile caricare i pasti.');
      } else {
        // Usiamo "data || []" per gestire il caso in cui "data" sia null
        setMeals(data || []);
      }
      setLoading(false);
    };

    checkUserAndFetchMeals();
  }, [router, supabase]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMeal(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMeal = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !newMeal.name || !newMeal.calories) {
      alert('Per favore, inserisci almeno il nome e le calorie del pasto.');
      return;
    }
    
    // Convertiamo i valori in numeri solo al momento dell'invio
    const mealToInsert = {
      user_id: user.id,
      name: newMeal.name,
      calories: parseInt(newMeal.calories, 10) || 0,
      protein: parseInt(newMeal.protein, 10) || 0,
      carbs: parseInt(newMeal.carbs, 10) || 0,
      fats: parseInt(newMeal.fats, 10) || 0,
    };

    const { data, error } = await supabase
      .from('meals')
      .insert(mealToInsert)
      .select()
      .single();

    if (error) {
      alert('Errore nell\'aggiungere il pasto: ' + error.message);
    } else if (data) {
      setMeals([data, ...meals]);
      setNewMeal({ name: '', calories: '', protein: '', carbs: '', fats: '' });
    }
  };
  
  if (loading) return <div className="flex min-h-screen items-center justify-center"><p>Caricamento...</p></div>;
  if (error) return <div className="flex min-h-screen items-center justify-center"><p>{error}</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">La Tua Dashboard</h1>
        
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800">Aggiungi un nuovo pasto</h2>
          <form onSubmit={handleAddMeal} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <input name="name" value={newMeal.name} onChange={handleInputChange} placeholder="Nome (es. Mela)" className="lg:col-span-2 block w-full rounded-md border-gray-300 shadow-sm" required />
            <input name="calories" type="number" value={newMeal.calories} onChange={handleInputChange} placeholder="Calorie" className="block w-full rounded-md border-gray-300 shadow-sm" required />
            <input name="protein" type="number" value={newMeal.protein} onChange={handleInputChange} placeholder="Proteine (g)" className="block w-full rounded-md border-gray-300 shadow-sm" />
            <input name="carbs" type="number" value={newMeal.carbs} onChange={handleInputChange} placeholder="Carboidrati (g)" className="block w-full rounded-md border-gray-300 shadow-sm" />
            <input name="fats" type="number" value={newMeal.fats} onChange={handleInputChange} placeholder="Grassi (g)" className="block w-full rounded-md border-gray-300 shadow-sm" />
            <button type="submit" className="sm:col-span-2 lg:col-span-5 w-full rounded-md bg-indigo-600 px-4 py-2 text-white font-semibold shadow-sm hover:bg-indigo-500">Aggiungi Pasto</button>
          </form>
        </div>

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
                </div>
              ))
            ) : (
              <div className="bg-white p-4 rounded-lg shadow-sm text-center text-gray-500"><p>Nessun pasto registrato.</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}