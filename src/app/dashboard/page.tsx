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
            <input name="calories" type="number" value={newMeal.calories} onChange={handleInputChange} placeholder="Cal