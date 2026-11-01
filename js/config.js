import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Remplacez par vos clés Supabase
const SUPABASE_URL = 'VOTRE_URL_SUPABASE';
const SUPABASE_ANON_KEY = 'VOTRE_CLE_ANON_SUPABASE';

// MODE TEST : si les clés ne sont pas encore renseignées, createClient() lève une erreur
// qui empêcherait toute la page de se charger. On l'intercepte pour que l'interface s'affiche.
let client = null;
try {
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
  console.warn("Supabase non configuré (clés manquantes) :", e.message);
}
export const supabase = client;
// Version d'origine : export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const TYPES = ["Exécution extrajudiciaire", "Détention arbitraire", "Torture", "Violences sexuelles", "Disparition forcée", "Liberté d'expression", "Recrutement d'enfants", "Déplacement forcé", "Autre"];
export const STATUTS = ["Signalé", "En vérification", "Vérifié", "Transmis aux autorités", "Clos"];
export const GRAV = { 1: "Faible", 2: "Modérée", 3: "Grave", 4: "Critique" };