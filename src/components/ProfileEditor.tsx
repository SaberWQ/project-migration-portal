import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function ProfileEditor() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setMessage('Будь ласка, увійдіть у свій акаунт.');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFullName(data.full_name || '');
        setAvatarUrl(data.avatar_url || '');
      }
    } catch (err: any) {
      console.error('Помилка завантаження профілю:', err.message);
    } finally {
      setLoading(false); // Завжди вимикаємо індикатор завантаження
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      setMessage('');

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setMessage('Потрібно авторизуватися для завантаження фото.');
        return;
      }

      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      // Завантаження файлу в Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Отримання публічного URL зображення
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
      setMessage('Фото успішно завантажено!');
    } catch (err: any) {
      setMessage(`Помилка завантаження: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage('');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Не авторизовано');

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      setMessage('Профіль успішно оновлено!');
    } catch (err: any) {
      setMessage(`Помилка збереження: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="text-center p-4">Завантаження даних...</p>;

  return (
    <form onSubmit={updateProfile} className="max-w-md mx-auto space-y-4 p-4 border rounded shadow-sm">
      <h2 className="text-xl font-bold">Редагування профілю</h2>

      <div className="flex flex-col items-center space-y-2">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
            Немає фото
          </div>
        )}

        <label className={`cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {uploading ? 'Завантаження...' : 'Змінити фото'}
          <input
            type="file"
            accept="image/*"
            onChange={uploadAvatar}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium">Ім'я / Псевдонім</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border p-2 rounded mt-1"
          placeholder="Введіть ваше ім'я"
        />
      </div>

      <button
        type="submit"
        disabled={loading || uploading}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium disabled:opacity-50"
      >
        {loading ? 'Збереження...' : 'Зберегти профіль'}
      </button>

      {message && <p className="text-sm text-center mt-2 text-gray-700">{message}</p>}
    </form>
  );
}