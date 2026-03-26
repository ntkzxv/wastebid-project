import { supabase } from '../supabase'

export const notificationService = {

  async getUserNotifications(userId: number) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data;
  },


  async markAsRead(notificationId: number) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
    return true;
  },

 
  subscribeToNotifications(userId: number, onNotify: (newNotif: any) => void) {
    return supabase
      .channel(`notif-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => onNotify(payload.new)
      )
      .subscribe();
  }
}