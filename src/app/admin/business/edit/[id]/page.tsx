// app/admin/business/edit/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft, Loader2, Building2, Clock, Plus, Trash2 } from 'lucide-react';
import ImageUpload, { MultiImageUpload } from '@/components/ImageUpload';
import { supabase } from '@/lib/supabaseClient';
import AdminHeader from "@/components/admin-header";

const defaultCategories = [
  { value: 'restaurants', label: 'Restaurants' },
  { value: 'homeServices', label: 'Home Services' },
  { value: 'babyKids', label: 'Baby & Kids' },
  { value: 'techMobile', label: 'Tech & Mobile' },
  { value: 'car', label: 'Auto Services' },
  { value: 'hospitals', label: 'Hospitals' },
  { value: 'beauty', label: 'Beauty & Wellness' },
  { value: 'clinics', label: 'Clinics' },
  { value: 'bookstores', label: 'Bookstores' },
  { value: 'luxe', label: 'Luxe' },
  { value: 'beach', label: 'Beach' },
  { value: 'other', label: 'Other (Specify)' },
];

const priceRanges = [
  { value: '$', label: '$ - Budget' },
  { value: '$$', label: '$$ - Moderate' },
  { value: '$$$', label: '$$$ - Expensive' },
  { value: '$$$$', label: '$$$$ - Luxury' },
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface TimeSlot {
  open: string;
  close: string;
}

interface Schedule {
  [key: string]: TimeSlot[];
}

export default function EditBusinessPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [categories, setCategories] = useState(defaultCategories);

  const [formData, setFormData] = useState({
    name: '',
    category: 'restaurants',
    customCategory: '', // New field for custom category
    rating: 0,
    reviews: 0,
    location: '',
    contact: '',
    email: '',
    services: '',
    description: '',
    website: '',
    businesstype: '',
    distance: '',
    pricerange: '$$',
    image: '',
    images: [] as string[],
  });

  const [schedule, setSchedule] = useState<Schedule>({
    Monday: [{ open: '09:00', close: '18:00' }],
    Tuesday: [{ open: '09:00', close: '18:00' }],
    Wednesday: [{ open: '09:00', close: '18:00' }],
    Thursday: [{ open: '09:00', close: '18:00' }],
    Friday: [{ open: '09:00', close: '18:00' }],
    Saturday: [{ open: '10:00', close: '17:00' }],
    Sunday: [],
  });

  useEffect(() => {
    const checkAdminAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/admin/login");
        return;
      }

      const userRole = session.user?.user_metadata?.role;
      const userEmail = session.user?.email;
      
      if (userRole !== "admin" && userEmail !== "admin@tookdeal.com") {
        await supabase.auth.signOut();
        router.push("/admin/login");
        return;
      }

      setAdminUser({
        id: session.user.id,
        email: session.user.email,
        role: userRole,
      });
      setAuthChecking(false);
    };

    const fetchCustomCategories = async () => {
      // Fetch all unique custom categories from database
      const { data, error } = await supabase
        .from('businesses')
        .select('category')
        .not('category', 'is', null);
      
      if (data) {
        // Get unique categories
        const uniqueCategories = [...new Set(data.map(b => b.category))];
        
        // Filter out the default categories to get only custom ones
        const defaultCategoryValues = defaultCategories.map(c => c.value);
        const customCategories = uniqueCategories
          .filter(cat => !defaultCategoryValues.includes(cat))
          .map(cat => ({ value: cat, label: cat }));
        
        // Combine: default categories + custom categories + "Other" at the end
        const otherOption = defaultCategories.find(c => c.value === 'other');
        const defaultWithoutOther = defaultCategories.filter(c => c.value !== 'other');
        
        setCategories([
          ...defaultWithoutOther,
          ...customCategories,
          otherOption!
        ]);
      }
    };

    checkAdminAuth();
    fetchCustomCategories();
  }, [router]);

  useEffect(() => {
    if (businessId && !authChecking) {
      loadBusiness();
    }
  }, [businessId, authChecking]);

  const loadBusiness = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (fetchError) throw fetchError;

      if (data) {
        // Check if category is a custom one (not in default list)
        const isCustomCategory = !defaultCategories.find(c => c.value === data.category);
        
        setFormData({
          name: data.name || '',
          category: isCustomCategory ? 'other' : (data.category || 'restaurants'),
          customCategory: isCustomCategory ? data.category : '',
          rating: data.rating || 0,
          reviews: data.reviews || 0,
          location: data.location || '',
          contact: data.contact || '',
          email: data.email || '',
          services: data.services || '',
          description: data.description || '',
          website: data.website || '',
          businesstype: data.businesstype || '',
          distance: data.distance || '',
          pricerange: data.pricerange || '$$',
          image: data.image || '',
          images: data.images || [],
        });

        // Load schedule if it exists
        if (data.schedule && typeof data.schedule === 'object') {
          setSchedule(data.schedule);
        }
      }
    } catch (err) {
      console.error('Error loading business:', err);
      setError(err instanceof Error ? err.message : 'Failed to load business');
      setTimeout(() => router.push('/admin'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const addTimeSlot = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: [...prev[day], { open: '09:00', close: '18:00' }]
    }));
  };

  const removeTimeSlot = (day: string, index: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index)
    }));
  };

  const updateTimeSlot = (day: string, index: number, field: 'open' | 'close', value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const copyToAllDays = (day: string) => {
    const slots = schedule[day];
    const newSchedule: Schedule = {};
    daysOfWeek.forEach(d => {
      newSchedule[d] = JSON.parse(JSON.stringify(slots));
    });
    setSchedule(newSchedule);
  };

  const markAsClosed = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: []
    }));
  };

  const generateOpenHoursText = () => {
    const lines: string[] = [];
    daysOfWeek.forEach(day => {
      if (schedule[day].length === 0) {
        lines.push(`${day}: Closed`);
      } else {
        const times = schedule[day]
          .map(slot => {
            const formatTime = (time: string) => {
              const [hours, minutes] = time.split(':');
              const h = parseInt(hours);
              const ampm = h >= 12 ? 'PM' : 'AM';
              const h12 = h % 12 || 12;
              return `${h12}:${minutes} ${ampm}`;
            };
            return `${formatTime(slot.open)} - ${formatTime(slot.close)}`;
          })
          .join(', ');
        lines.push(`${day}: ${times}`);
      }
    });
    return lines.join('\n');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (!formData.name || !formData.category) {
        throw new Error('Name and category are required');
      }

      // Check if "Other" is selected but custom category is empty
      if (formData.category === 'other' && !formData.customCategory.trim()) {
        throw new Error('Please specify the category when selecting "Other"');
      }

      const openHoursText = generateOpenHoursText();
      
      // Use custom category if "other" is selected, otherwise use selected category
      const finalCategory = formData.category === 'other' 
        ? formData.customCategory.trim() 
        : formData.category;

      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          name: formData.name,
          category: finalCategory,
          rating: formData.rating,
          reviews: formData.reviews,
          location: formData.location,
          contact: formData.contact,
          email: formData.email,
          openhours: openHoursText,
          schedule: schedule,
          services: formData.services,
          description: formData.description,
          website: formData.website,
          businesstype: formData.businesstype,
          distance: formData.distance,
          pricerange: formData.pricerange,
          image: formData.image,
          images: formData.images,
          updated_at: new Date().toISOString(),
        })
        .eq('id', businessId);

      if (updateError) throw updateError;

      // Show success alert and redirect
      alert('✅ Business updated successfully!');
      router.push('/admin');
    } catch (err) {
      console.error('Error updating business:', err);
      setError(err instanceof Error ? err.message : 'Failed to update business');
      setSaving(false);
    }
  };

  if (authChecking || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-gray-700 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">
            {authChecking ? 'Verifying access...' : 'Loading business...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminHeader adminUser={adminUser} />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <button
          onClick={() => router.push('/admin')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Admin</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Business</h1>
              <p className="text-gray-600 text-sm mt-0.5">Update business information and schedule</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 pb-3 border-b border-gray-200">
              Basic Information
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="Enter business name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <select
                  name="pricerange"
                  value={formData.pricerange}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                >
                  {priceRanges.map(pr => (
                    <option key={pr.value} value={pr.value}>
                      {pr.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Category Input - Shows when "Other" is selected */}
            {formData.category === 'other' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specify Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customCategory"
                  value={formData.customCategory}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="e.g., Pet Stores, Fitness Centers, Law Firms, etc."
                />
                <p className="text-xs text-blue-700 mt-2 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  This will use a generic building icon on the frontend
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
                placeholder="Describe the business..."
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 pb-3 border-b border-gray-200">
              Contact Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="919876543210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="contact@business.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="Street, City, State"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="https://www.business.com"
              />
            </div>
          </div>

          {/* Opening Hours Schedule */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Opening Hours Schedule
                </h2>
              </div>
              <div className="text-xs text-green-700 bg-green-50 px-3 py-1 rounded-full font-medium">
                ✓ Auto updates open/close status
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The business will automatically show as "Open" or "Closed" based on this schedule. No manual updates needed!
              </p>
            </div>

            <div className="space-y-4">
              {daysOfWeek.map(day => (
                <div key={day} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-base">{day}</h3>
                    <div className="flex gap-2">
                      {schedule[day].length > 0 && (
                        <button
                          type="button"
                          onClick={() => markAsClosed(day)}
                          className="text-xs px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                        >
                          Mark Closed
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => copyToAllDays(day)}
                        className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Copy to all days
                      </button>
                      <button
                        type="button"
                        onClick={() => addTimeSlot(day)}
                        className="text-xs px-3 py-1 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add time slot
                      </button>
                    </div>
                  </div>

                  {schedule[day].length === 0 ? (
                    <div className="text-sm text-red-600 font-medium bg-red-50 rounded-lg p-3 border border-red-200">
                      🔒 Closed all day
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {schedule[day].map((slot, index) => (
                        <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 font-medium min-w-[60px]">
                            {index === 0 ? 'Opens:' : `Slot ${index + 1}:`}
                          </label>
                          <input
                            type="time"
                            value={slot.open}
                            onChange={(e) => updateTimeSlot(day, index, 'open', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          />
                          <span className="text-gray-500 font-medium">to</span>
                          <input
                            type="time"
                            value={slot.close}
                            onChange={(e) => updateTimeSlot(day, index, 'close', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(day, index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                            title="Remove this time slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 pb-3 border-b border-gray-200">
              Business Details
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Services Offered
              </label>
              <input
                type="text"
                name="services"
                value={formData.services}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="Delivery, Dine-in, Takeaway"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (0-5)
                </label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="4.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Reviews
                </label>
                <input
                  type="number"
                  name="reviews"
                  value={formData.reviews}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="150"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 pb-3 border-b border-gray-200">
              Images
            </h2>

            <ImageUpload
              label="Main Image"
              onImageUploaded={(url) => setFormData(prev => ({ ...prev, image: url }))}
              currentImage={formData.image}
            />

            <MultiImageUpload
              onImagesUploaded={(urls) => setFormData(prev => ({ ...prev, images: urls }))}
              currentImages={formData.images}
              maxImages={5}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Business
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}