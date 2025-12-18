// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Odczytujemy zmienne środowiskowe
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Sprawdzamy, czy zmienne zostały załadowane
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing. Make sure you have a .env file set up.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Adres IP jest teraz również zmienną środowiskową
export const ESP32_IP = import.meta.env.VITE_ESP32_IP;