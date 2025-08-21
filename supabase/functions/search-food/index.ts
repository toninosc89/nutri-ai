import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Headers per abilitare CORS (permette al nostro sito di chiamare la funzione)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Gestisce la richiesta pre-flight CORS, necessaria per i browser
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Estrae il termine di ricerca dal corpo della richiesta
    const { query } = await req.json();
    if (!query) {
      throw new Error('Il termine di ricerca (query) è obbligatorio.');
    }

    // Costruisce l'URL per l'API di Open Food Facts
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
      query
    )}&search_simple=1&action=process&json=1&page_size=10`;

    // Esegue la ricerca
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`Errore dalla rete: ${response.statusText}`);
    }
    const data = await response.json();

    // Estrae e formatta solo i dati che ci servono
    const foods = data.products.map((product: any) => ({
      name: product.product_name || 'Nome non disponibile',
      calories: product.nutriments['energy-kcal_100g'] || 0,
      protein: product.nutriments.proteins_100g || 0,
      carbs: product.nutriments.carbohydrates_100g || 0,
      fats: product.nutriments.fats_100g || 0,
    })).filter((food: any) => food.calories > 0); // Filtra i cibi senza dati calorici

    // Restituisce i dati formattati
    return new Response(JSON.stringify({ foods }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    // Gestisce eventuali errori
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});