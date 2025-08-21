'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState, FormEvent, ChangeEvent, useCallback } from 'react';
import type { User } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';

type Meal = Database['public']['Tables']['meals']['Row'];
type NewMealForm = { name: string; calories: string; protein: string; carbs: string; fats: string; };
// Definiamo un tipo per i risultati della ricerca
type FoodSearchResult = { name: string; calories: number; protein: number; carbs: number; fats: number; };

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [newMeal, setNewMeal] = useState<NewMealForm>({ name: '', calories: '', protein: '', carbs: '', fats: '' });
  const [loading, setLoading] = useState(true);
  
  // Stati per la ricerca
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  // --- Funzioni esistenti (fetchMeals, handleInputChange, handleAddMeal) ---
  // (Le inseriremo qui per completezza, ma restano quasi identiche)

  const handleAddMeal = async (e: FormEvent) => {
    e.preventDefault();
    // ... (Logica per aggiungere il pasto, invariata)
  };

  // --- Logica per la ricerca ---
  useEffect(() => {
    const searchFood = async () => {
      if (searchTerm.trim().length < 3) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const { data, error } = await supabase.functions.invoke('search-food', {
          body: { query: searchTerm },
        });
        if (error) throw error;
        setSearchResults(data.foods);
      } catch (error) {
        console.error('Error searching food:', error);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce: attende 500ms dopo che l'utente ha smesso di scrivere prima di cercare
    const debounceTimeout = setTimeout(() => {
      searchFood();
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, supabase]);

  const handleSelectFood = (food: FoodSearchResult) => {
    setNewMeal({
      name: food.name,
      calories: String(Math.round(food.calories)),
      protein: String(Math.round(food.protein)),
      carbs: String(Math.round(food.carbs)),
      fats: String(Math.round(food.fats)),
    });
    setSearchTerm('');
    setSearchResults([]);
  };

  // ... (Logica di caricamento iniziale e autenticazione, invariata)
  useEffect(() => {
    // ...
  }, []);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p>Caricamento...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">La Tua Dashboard</h1>
        
        {/* Modulo di Ricerca e Aggiunta Pasto */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800">Aggiungi un pasto</h2>
          
          {/* Barra di Ricerca */}
          <div className="mt-4 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca un cibo (es. Mela)..."
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
            {isSearching && <p className="text-sm text-gray-500 mt-1">Ricerca in corso...</p>}
            {searchResults.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                {searchResults.map((food, index) => (
                  <li key={index} onClick={() => handleSelectFood(food)} className="p-2 hover:bg-gray-100 cursor-pointer">
                    <p className="font-semibold">{food.name}</p>
                    <p className="text-xs text-gray-500">{Math.round(food.calories)} kcal per 100g</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 border-t pt-4">
            <h3 className="font-medium text-gray-700">Dettagli pasto (compilazione automatica)</h3>
            <form onSubmit={handleAddMeal} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {/* Gli input sono gli stessi di prima, ma ora vengono auto-compilati */}
              <input name="name" value={newMeal.name} onChange={handleInputChange} placeholder="Nome" className="lg:col-span-2 ..." required />
              <input name="calories" type="number" value={newMeal.calories} onChange={handleInputChange} placeholder="Calorie" className="..." required />
              <input name="protein" type="number" value={newMeal.protein} onChange={handleInputChange} placeholder="Proteine (g)" className="..." />
              <input name="carbs" type="number" value={newMeal.carbs} onChange={handleInputChange} placeholder="Carboidrati (g)" className="..." />
              <input name="fats" type="number" value={newMeal.fats} onChange={handleInputChange} placeholder="Grassi (g)" className="..." />
              <button type="submit" className="sm:col-span-2 lg:col-span-5 ...">Aggiungi Pasto</button>
            </form>
          </div>
        </div>

        {/* Lista dei Pasti Registrati (invariata) */}
        <div className="mt-8">
          {/* ... */}
        </div>
      </div>
    </div>
  );
}

// Includi qui le funzioni handleInputChange, handleAddMeal e useEffect di autenticazione
// dalla versione precedente per avere il file completo.