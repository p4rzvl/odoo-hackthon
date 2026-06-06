'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { loginSchema, LoginInput } from '../../validations/auth.validation';
import { Mail, Lock, Loader2, ArrowRight, User } from 'lucide-react';

export default function LoginPage() {
  const { login, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const router = useRouter();

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
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: emailParam
    }
  });

  useEffect(() => {
    if (emailParam) {
      setValue('email', emailParam);
    }
  }, [emailParam, setValue]);

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const res = await login(data);
      if (res.success) {
        toast.success('Successfully logged in!');
      } else {
        toast.error(res.error || 'Invalid credentials');
      }
    } catch (err: any) {
      toast.error('Network connection issue. Please check your backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6 font-sans text-[#212529]">
      <div className="w-full max-w-md bg-white rounded-[12px] border border-[#e5e5e5] shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden">
        {/* Banner with Odoo brand primary color */}
        <div className="bg-[#714B67] p-6 text-center text-white">
          <h1 className="text-xl font-bold tracking-tight font-sans">Odoo ERP Login</h1>
          <p className="text-xs text-purple-200 mt-1">Login Screen (Screen 1)</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          {/* Circular Photo Placeholder at the top, matching Screen 1 mockup */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[#f8f9fa] border border-[#e5e5e5] flex items-center justify-center shadow-inner text-[#8F8F8F]">
              <User className="w-9 h-9 stroke-[1.5]" />
            </div>
            <span className="text-[10px] font-semibold text-[#8f8f8f] mt-1 uppercase tracking-wider">Photo</span>
          </div>

          {/* Email field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#6b7280] block">Username / Email</label>
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

          {/* Password field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#6b7280] block">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8F8F8F]">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
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
            className="w-full h-11 bg-[#714B67] hover:bg-[#9e7592] active:bg-[#5a3c52] text-white text-sm font-semibold rounded-[6px] flex items-center justify-center space-x-2 transition-all shadow-sm disabled:opacity-50 mt-4"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Navigation link */}
          <p className="text-center text-xs text-[#6b7280]">
            New user?{' '}
            <Link href="/register" className="text-[#714B67] font-semibold hover:text-[#9e7592] hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
