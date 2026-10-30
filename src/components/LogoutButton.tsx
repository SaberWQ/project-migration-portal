import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Очищаем локальное состояние и перенаправляем на страницу входа
      window.location.href = '/login';
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
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
    >
      {loading ? 'Вихід...' : 'Вийти'}
    </button>
  );
}