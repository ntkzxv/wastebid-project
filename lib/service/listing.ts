import { supabase } from '../supabase'

export const listingService = {
  
  async createListing(data: {
    owner_id: number;
    title: string;
    description: string;
    start_price: number;
    min_increment: number;
    start_time: string; 
    end_time: string;
  }) {
    const { data: newListing, error } = await supabase
      .from('waste_listings')
      .insert([{
        ...data,
        current_price: data.start_price, 
        status: 'open',
        version: 1
      }])
      .select()
      .single();

    if (error) throw error;
    return newListing;
  },


  async getActiveListings() {
    const { data, error } = await supabase
      .from('waste_listings')
      .select(`
        id, title, current_price, end_time, status, image_url,
        users!waste_listings_owner_id_fkey ( username ) -- ดึงชื่อคนขายมาด้วย
      `)
      .eq('status', 'open') 
      .gt('end_time', new Date().toISOString()) 
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },


  async getListingById(id: number) {
    const { data, error } = await supabase
      .from('waste_listings')
      .select(`
        *,
        owner:users!waste_listings_owner_id_fkey ( username, email ),
        current_bidder:users!waste_listings_current_bidder_id_fkey ( username )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
}