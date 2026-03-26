import { supabase } from '../supabase'

export const authService = {

  async signUp(email: string, password: string, username: string) {
   
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError) throw authError;


    if (authData.user) {
      const { error: dbError } = await supabase.from('users').insert([{
        id: authData.user.id,  
        email: email,
        password_hash: 'managed_by_supabase_auth', 
        username: username,
      }]);
      if (dbError) throw dbError;
    }
    return authData;
  },


  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },


  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },


  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    

    const { data: userData } = await supabase.from('users').select('*').eq('email', user.email).single();
    return userData;
  }
}