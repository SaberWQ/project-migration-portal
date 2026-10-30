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
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

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
      console.error('Error loading profile:', err.message);
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

      if (!user) throw new Error('Not authenticated');

      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public image URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
      setMessage('Photo uploaded successfully!');
    } catch (err: any) {
      setMessage(`Upload failed: ${err.message}`);
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
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setMessage(`Update failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !fullName && !avatarUrl) return <p>Loading profile...</p>;

  return (
    <form onSubmit={updateProfile} className="max-w-md mx-auto space-y-4 p-4 border rounded">
      <h2>Edit Profile</h2>

      <div className="flex flex-col items-center space-y-2">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
            No Image
          </div>
        )}

        <label className="cursor-pointer bg-blue-500 text-white px-3 py-1 rounded text-sm">
          {uploading ? 'Uploading...' : 'Change Photo'}
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
        <label className="block text-sm font-medium">Full Name / Display Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border p-2 rounded mt-1"
          placeholder="John Doe"
        />
      </div>

      <button
        type="submit"
        disabled={loading || uploading}
        className="w-full bg-green-600 text-white py-2 rounded font-medium disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Profile'}
      </button>

      {message && <p className="text-sm text-center mt-2">{message}</p>}
    </form>
  );
}