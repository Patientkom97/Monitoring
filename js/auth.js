// import { supabase } from './config.js';

// export async function initAuth(onAuthChange) {
//   const { data: { session } } = await supabase.auth.getSession();
//   onAuthChange(session?.user || null);

//   supabase.auth.onAuthStateChange((_event, session) => {
//     onAuthChange(session?.user || null);
//   });

//   document.getElementById('authForm').addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const email = document.getElementById('authEmail').value;
//     const password = document.getElementById('authPassword').value;
//     const { error } = await supabase.auth.signInWithPassword({ email, password });
//     if (error) document.getElementById('authError').textContent = error.message;
//   });

//   document.getElementById('btnLogout').addEventListener('click', () => supabase.auth.signOut());
// }