import { supabase } from '../supabase' 

export const bidService = {
  
 
  async placeBid(listingId: number, userId: number, bidAmount: number, currentVersion: number) {
    try {
    
      const { data, error } = await supabase.rpc('place_bid', {
        p_listing_id: listingId,
        p_user_id: userId,
        p_bid_amount: bidAmount,
        p_current_version: currentVersion
      });

      if (error) {

        console.error("ประมูลไม่สำเร็จ:", error.message);
        return { success: false, message: error.message };
      }

    
      return data; 

    } catch (err: any) {
      console.error("System Error:", err.message);
      return { success: false, message: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์" };
    }
  },

 
  async getBidLogs(listingId: number) {
    const { data, error } = await supabase
      .from('bid_logs')
      .select(`
        id, amount, action, timestamp,
        users ( username ) -- Join ตาราง users เพื่อเอาชื่อคนประมูลมาโชว์ด้วย
      `)
      .eq('listing_id', listingId)
      .order('timestamp', { ascending: false })
      .limit(10); 

    if (error) {
      console.error("ดึง Log ไม่สำเร็จ:", error.message);
      throw error;
    }
    return data;
  },


  subscribeToListing(listingId: number, onUpdate: (newListingData: any) => void) {
    const channel = supabase
      .channel(`auction-room-${listingId}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'waste_listings', 
          filter: `id=eq.${listingId}` 
        },
        (payload) => {
          console.log('🔥 มีคนประมูล! อัปเดตข้อมูล Real-time:', payload.new);
          onUpdate(payload.new); 
        }
      )
      .subscribe();

    return channel; 
  }
}