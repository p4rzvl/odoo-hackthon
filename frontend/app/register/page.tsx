'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { registerSchema, RegisterInput } from '../../validations/auth.validation';
import { User, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register: authRegister } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      const res = await authRegister(data);
      if (res.success) {
        toast.success('Account created successfully!');
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
      <div className="w-full max-w-md bg-white rounded-[8px] border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* Banner with Odoo brand primary color */}
        <div className="bg-[#714B67] p-8 text-center text-white">
          <h1 className="text-2xl font-bold tracking-tight">Odoo Registration</h1>
          <p className="text-xs text-purple-200 mt-2">Initialize your sandboxed developer account credentials</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-5">
          {/* Name field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#6b7280] block">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8F8F8F]">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="John Doe"
                {...formRegister('name')}
                className={`w-full pl-9 pr-3 py-2 bg-[#f8f9fa] border rounded-[6px] text-sm outline-none transition-all ${
                  errors.name
                    ? 'border-red-400 focus:ring-1 focus:ring-red-400'
                    : 'border-[#e5e5e5] focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67]'
                }`}
              />
            </div>
            {errors.name && <p className="text-xs text-[#dc2626] font-semibold">{errors.name.message}</p>}
          </div>

          {/* Email field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#6b7280] block">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8F8F8F]">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                placeholder="user@example.com"
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

          {/* Password field */}
          <div className="space-y-1">
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

          {/* Action button hover transition maps to o-brand-light (#9e7592) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#714B67] hover:bg-[#9e7592] active:bg-[#5a3c52] text-white text-sm font-semibold rounded-[6px] flex items-center justify-center space-x-2 transition-all shadow-sm disabled:opacity-50"
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

          {/* Navigation link */}
          <p className="text-center text-xs text-[#6b7280] mt-4">
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
