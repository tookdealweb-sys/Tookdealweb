'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Mail, Phone, User, Save, X, Edit2, Loader2, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface FormData {
  displayName: string;
  phone: string;
  avatarUrl: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    displayName: '',
    phone: '',
    avatarUrl: ''
  });

  useEffect(() => {
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      } else if (event === 'SIGNED_IN' && session) {
        loadUserData(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async (): Promise<void> => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setError('Failed to load session');
        setLoading(false);
        return;
      }

      if (!session) {
        console.log('No active session, redirecting to login...');
        router.push('/login');
        return;
      }

      console.log('Session found:', session.user);
      loadUserData(session.user);
    } catch (err) {
      console.error('Auth check error:', err);
      setError('Failed to authenticate');
      setLoading(false);
    }
  };

  const loadUserData = (userData: SupabaseUser): void => {
    console.log('Loading user data:', userData);
    setUser(userData);
    
    // Handle different auth providers - same logic as header
    const displayName = userData.user_metadata?.full_name || 
                       userData.user_metadata?.name || 
                       userData.user_metadata?.display_name ||
                       userData.user_metadata?.username || 
                       userData.email?.split('@')[0] || '';
    
    const avatarUrl = userData.user_metadata?.avatar_url || 
                     userData.user_metadata?.picture || '';
    
    const phone = userData.user_metadata?.phone || 
                 userData.phone || '';

    setFormData({
      displayName,
      phone,
      avatarUrl
    });
    
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      // Create a local preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatarUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
      
      // If you have Supabase Storage set up, uncomment this:
      /*
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        avatarUrl: data.publicUrl
      }));
      */
      
      alert('Image loaded! Click Save to update your profile.');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.displayName,
          phone: formData.phone,
          avatar_url: formData.avatarUrl
        }
      });

      if (error) throw error;

      console.log('Profile updated:', data);
      
      // Reload user data
      if (data.user) {
        loadUserData(data.user);
      }
      
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(`Error updating profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = (): void => {
    const displayName = user?.user_metadata?.full_name || 
                       user?.user_metadata?.name || 
                       user?.user_metadata?.display_name ||
                       user?.user_metadata?.username || 
                       user?.email?.split('@')[0] || '';
    
    const avatarUrl = user?.user_metadata?.avatar_url || 
                     user?.user_metadata?.picture || '';
    
    const phone = user?.user_metadata?.phone || 
                 user?.phone || '';

    setFormData({
      displayName,
      phone,
      avatarUrl
    });
    setIsEditing(false);
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error signing out. Please try again.');
    }
  };

  const getProviderName = (): string => {
    if (!user) return 'Unknown';
    
    const provider = user.app_metadata?.provider;
    if (provider === 'google') return 'Google';
    if (provider === 'email') return 'Email';
    if (provider === 'github') return 'GitHub';
    return provider || 'Email';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#00d4ad] mx-auto mb-4" />
          <p className="text-gray-600 dark:text-zinc-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-8 rounded-2xl shadow-lg">
          <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-[#00d4ad] text-white px-6 py-2 rounded-lg hover:bg-[#00b89a] transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-8 rounded-2xl shadow-lg">
          <p className="text-gray-800 dark:text-white text-lg mb-4">Please log in to view your profile</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-[#00d4ad] text-white px-6 py-2 rounded-lg hover:bg-[#00b89a] transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="mb-6 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </button>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#00d4ad] to-[#00b89a] px-8 py-12 relative">
            <div className="absolute top-6 right-6 flex gap-2 flex-wrap">
              <button
                onClick={handleSignOut}
                className="bg-red-500 dark:bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 dark:hover:bg-red-700 transition flex items-center gap-2 shadow-lg"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white dark:bg-zinc-800 text-[#00d4ad] dark:text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition flex items-center gap-2 shadow-lg border border-transparent dark:border-zinc-700"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit Profile</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-zinc-700 transition flex items-center gap-2 disabled:opacity-50 shadow-lg border border-transparent dark:border-zinc-700"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 dark:hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50 shadow-lg"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Save</span>
                  </button>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-white dark:bg-zinc-800 p-1 shadow-lg border-4 border-white/20">
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[#00d4ad] to-[#00b89a] flex items-center justify-center">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-[#00d4ad] text-white p-3 rounded-full cursor-pointer hover:bg-[#00b89a] transition shadow-lg">
                    {uploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="px-8 py-8">
            <div className="space-y-6">
              {/* Display Name */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  <User className="w-4 h-4 mr-2 text-gray-500 dark:text-zinc-400" />
                  Display Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#00d4ad] focus:border-transparent transition"
                    placeholder="Enter your name"
                  />
                ) : (
                  <p className="text-lg text-gray-900 dark:text-white px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-transparent dark:border-zinc-700 rounded-lg">
                    {formData.displayName || 'Not set'}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  <Mail className="w-4 h-4 mr-2 text-gray-500 dark:text-zinc-400" />
                  Email Address
                </label>
                <p className="text-lg text-gray-900 dark:text-white px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-transparent dark:border-zinc-700 rounded-lg flex items-center justify-between flex-wrap gap-2">
                  <span className="break-all">{user.email}</span>
                  <span className="text-xs text-gray-500 dark:text-zinc-400 bg-gray-200 dark:bg-zinc-700 px-2 py-1 rounded whitespace-nowrap">
                    Read only
                  </span>
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  <Phone className="w-4 h-4 mr-2 text-gray-500 dark:text-zinc-400" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#00d4ad] focus:border-transparent transition"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="text-lg text-gray-900 dark:text-white px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-transparent dark:border-zinc-700 rounded-lg">
                    {formData.phone || 'Not set'}
                  </p>
                )}
              </div>

              {/* Provider */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2 block">
                  Login Provider
                </label>
                <p className="text-sm text-gray-600 dark:text-zinc-400 px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-transparent dark:border-zinc-700 rounded-lg flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getProviderName() === 'Google' ? 'bg-red-500' : 'bg-[#00d4ad]'}`}></span>
                  {getProviderName()}
                </p>
              </div>

              {/* User ID */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2 block">
                  User ID
                </label>
                <p className="text-sm text-gray-600 dark:text-zinc-400 px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-transparent dark:border-zinc-700 rounded-lg font-mono break-all">
                  {user.id}
                </p>
              </div>

              {/* Account Created */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2 block">
                  Account Created
                </label>
                <p className="text-sm text-gray-600 dark:text-zinc-400 px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-transparent dark:border-zinc-700 rounded-lg">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}