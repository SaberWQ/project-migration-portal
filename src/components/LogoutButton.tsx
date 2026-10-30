import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Перенаправление на корректную страницу авторизации (/auth)
      window.location.href = '/auth';
    } catch (err: any) {
      console.error('Помилка при виході:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
    >
      {loading ? 'Вихід...' : 'Вийти'}
    </button>
  );
}