'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { registerSchema, RegisterInput } from '../../validations/auth.validation';
import { User, Mail, Lock, Loader2, ArrowRight, Phone, Globe, Info, Camera } from 'lucide-react';

export default function RegisterPage() {
  const { register: authRegister, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const {
    register: formRegister,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'OFFICER'
    }
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPhotoPreview(base64String);
        setValue('profilePhoto', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      const res = await authRegister(data);
      if (res.success) {
        toast.success(res.message || 'Registration successful! Pending Admin activation.');
        router.push(`/login?email=${encodeURIComponent(data.email)}&registered=true`);
      } else {
        toast.error(res.error || 'Failed to register account.');
      }
    } catch (err: any) {
      toast.error('Network connection issue. Please check your backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6 font-sans text-[#212529]">
      <div className="w-full max-w-2xl bg-white rounded-[12px] border border-[#e5e5e5] shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden">
        {/* Banner with Odoo brand primary color */}
        <div className="bg-[#714B67] p-6 text-center text-white relative">
          <h1 className="text-2xl font-bold tracking-tight">Create Odoo ERP Account</h1>
          <p className="text-xs text-purple-200 mt-1">Registration Screen (Screen 2)</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          {/* Circular Photo Upload Section */}
          <div className="flex flex-col items-center space-y-2">
            <div 
              onClick={triggerFileSelect} 
              className="relative w-24 h-24 rounded-full border-2 border-dashed border-[#714B67]/30 hover:border-[#714B67] bg-[#f8f9fa] flex items-center justify-center cursor-pointer transition-all overflow-hidden group shadow-inner"
            >
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={photoPreview} 
                  alt="Profile Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-[#8F8F8F] group-hover:text-[#714B67] transition-all">
                  <User className="w-8 h-8 mx-auto stroke-[1.5]" />
                  <span className="text-[10px] font-semibold block mt-1">Photo</span>
                </div>
              )}
              <div className="absolute inset-0 bg-[#714B67]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoChange} 
              accept="image/*" 
              className="hidden"
            />
            <button 
              type="button" 
              onClick={triggerFileSelect} 
              className="text-xs text-[#714B67] font-semibold hover:underline"
            >
              Upload profile picture
            </button>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6b7280] block">First Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8F8F8F]">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="First name"
                  {...formRegister('firstName')}
                  className={`w-full pl-9 pr-3 py-2 bg-[#f8f9fa] border rounded-[6px] text-sm outline-none transition-all ${
                    errors.firstName
                      ? 'border-red-400 focus:ring-1 focus:ring-red-400'
                      : 'border-[#e5e5e5] focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67]'
                  }`}
                />
              </div>
              {errors.firstName && <p className="text-xs text-[#dc2626] font-semibold">{errors.firstName.message}</p>}
            </div>

            {/* Last Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6b7280] block">Last Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8F8F8F]">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Last name"
                  {...formRegister('lastName')}
                  className={`w-full pl-9 pr-3 py-2 bg-[#f8f9fa] border rounded-[6px] text-sm outline-none transition-all ${
                    errors.lastName
                      ? 'border-red-400 focus:ring-1 focus:ring-red-400'
                      : 'border-[#e5e5e5] focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67]'
                  }`}
                />
              </div>
              {errors.lastName && <p className="text-xs text-[#dc2626] font-semibold">{errors.lastName.message}</p>}
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6b7280] block">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8F8F8F]">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  placeholder="email@example.com"
                  {...formRegister('email')}
                  className={`w-full pl-9 pr-3 py-2 bg-[#f8f9fa] border rounded-[6px] text-sm outline-none transition-all ${
                    errors.email
                      ? 'border-red-400 focus:ring-1 focus:ring-red-400'
                      : 'border-[#e5e5e5] focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67]'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-[#dc2626] font-semibold">{errors.email.message}</p>}
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6b7280] block">Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8F8F8F]">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  {...formRegister('phone')}
                  className={`w-full pl-9 pr-3 py-2 bg-[#f8f9fa] border rounded-[6px] text-sm outline-none transition-all ${
                    errors.phone
                      ? 'border-red-400 focus:ring-1 focus:ring-red-400'
                      : 'border-[#e5e5e5] focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67]'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-xs text-[#dc2626] font-semibold">{errors.phone.message}</p>}
            </div>

            {/* Role (Officer, Vendor, Manager) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6b7280] block">Role</label>
              <div className="relative">
                <select
                  {...formRegister('role')}
                  className={`w-full px-3 py-2 bg-[#f8f9fa] border rounded-[6px] text-sm outline-none transition-all border-[#e5e5e5] focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67]`}
                >
                  <option value="OFFICER">Officer</option>
                  <option value="VENDOR">Vendor</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>
              {errors.role && <p className="text-xs text-[#dc2626] font-semibold">{errors.role.message}</p>}
            </div>

            {/* Country */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6b7280] block">Country</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8F8F8F]">
                  <Globe className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Belgium"
                  {...formRegister('country')}
                  className={`w-full pl-9 pr-3 py-2 bg-[#f8f9fa] border rounded-[6px] text-sm outline-none transition-all ${
                    errors.country
                      ? 'border-red-400 focus:ring-1 focus:ring-red-400'
                      : 'border-[#e5e5e5] focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67]'
                  }`}
                />
              </div>
              {errors.country && <p className="text-xs text-[#dc2626] font-semibold">{errors.country.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-[#6b7280] block">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8F8F8F]">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  {...formRegister('password')}
                  className={`w-full pl-9 pr-3 py-2 bg-[#f8f9fa] border rounded-[6px] text-sm outline-none transition-all ${
                    errors.password
                      ? 'border-red-400 focus:ring-1 focus:ring-red-400'
                      : 'border-[#e5e5e5] focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67]'
                  }`}
                />
              </div>
              {errors.password && <p className="text-xs text-[#dc2626] font-semibold">{errors.password.message}</p>}
            </div>

            {/* Additional Information */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-[#6b7280] block">Additional Information</label>
              <div className="relative">
                <span className="absolute top-3 left-3 text-[#8F8F8F]">
                  <Info className="w-4 h-4" />
                </span>
                <textarea
                  placeholder="Additional details..."
                  rows={3}
                  {...formRegister('additionalInfo')}
                  className={`w-full pl-9 pr-3 py-2 bg-[#f8f9fa] border rounded-[6px] text-sm outline-none transition-all ${
                    errors.additionalInfo
                      ? 'border-red-400 focus:ring-1 focus:ring-red-400'
                      : 'border-[#e5e5e5] focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67]'
                  }`}
                />
              </div>
              {errors.additionalInfo && <p className="text-xs text-[#dc2626] font-semibold">{errors.additionalInfo.message}</p>}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#714B67] hover:bg-[#9e7592] active:bg-[#5a3c52] text-white text-sm font-semibold rounded-[6px] flex items-center justify-center space-x-2 transition-all shadow-sm disabled:opacity-50 mt-4"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Register</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Link to login page */}
          <p className="text-center text-xs text-[#6b7280]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#714B67] font-semibold hover:text-[#9e7592] hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
