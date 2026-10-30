import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export function ProfileEditor() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [message, setMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setMessage('Помилка: користувач не авторизований');
        console.warn('Користувача не знайдено в сесії Supabase');
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
      setMessage(`Помилка завантаження: ${err.message}`);
    } finally {
      setLoading(false);
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
        setMessage('Необхідна авторизація');
        return;
      }

      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
      setMessage('Фото успішно завантажено!');
    } catch (err: any) {
      console.error('Помилка під час завантаження фото:', err);
      setMessage(`Помилка під час завантаження: ${err.message}`);
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
      if (!user) throw new Error('Користувач не авторизований');

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      setMessage('Профіль успішно збережено!');
    } catch (err: any) {
      setMessage(`Помилка збереження: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={updateProfile} className="max-w-md mx-auto space-y-4 p-4 border rounded shadow-sm bg-white">
      <h2 className="text-xl font-bold text-center">Редагування профілю</h2>

      <div className="flex flex-col items-center space-y-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
            Немає фото
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={uploadAvatar}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 cursor-pointer"
        >
          {uploading ? 'Завантаження...' : 'Змінити фото'}
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Ім'я / Псевдонім</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Введіть ваше ім'я"
        />
      </div>

      <button
        type="submit"
        disabled={loading || uploading}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium disabled:opacity-50 cursor-pointer"
      >
        {loading ? 'Збереження...' : 'Зберегти профіль'}
      </button>

      {message && <p className="text-sm text-center mt-2 font-medium text-gray-700">{message}</p>}
    </form>
  );
}