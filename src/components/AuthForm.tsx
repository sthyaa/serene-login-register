import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import { signUp, signIn, resetPassword } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLogin) {
        const { user, error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: "Login Failed",
            description: error,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in."
          });
        }
      } else {
        const { user, error } = await signUp(formData.email, formData.password, formData.name);
        if (error) {
          toast({
            title: "Registration Failed",
            description: error,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Account Created!",
            description: "Your account has been created successfully."
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first.",
        variant: "destructive"
      });
      return;
    }

    const { success, error } = await resetPassword(formData.email);
    if (success) {
      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions."
      });
    } else {
      toast({
        title: "Reset Failed",
        description: error,
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 via-purple-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 space-y-6 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/30 to-cyan-200/30 rounded-full translate-y-12 -translate-x-12"></div>
          
          {/* Header */}
          <div className="text-center space-y-3 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-300 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              {isLogin ? 'Welcome back' : 'Join us today'}
            </h1>
            <p className="text-slate-600">
              {isLogin 
                ? 'Sign in to your account to continue' 
                : 'Create your account and start your journey'
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {/* Name field - only for register */}
            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl bg-gradient-to-r from-purple-50/50 to-pink-50/50 focus:from-purple-100/50 focus:to-pink-100/50 focus:ring-4 focus:ring-purple-200/50 focus:border-purple-300 transition-all duration-300 placeholder-slate-400 ${
                      errors.name ? 'border-rose-300 bg-rose-50/50' : 'border-purple-200'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && <p className="text-rose-500 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-rose-500 rounded-full"></span>
                  {errors.name}
                </p>}
              </div>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl bg-gradient-to-r from-blue-50/50 to-cyan-50/50 focus:from-blue-100/50 focus:to-cyan-100/50 focus:ring-4 focus:ring-blue-200/50 focus:border-blue-300 transition-all duration-300 placeholder-slate-400 ${
                    errors.email ? 'border-rose-300 bg-rose-50/50' : 'border-blue-200'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-rose-500 text-sm flex items-center gap-1">
                <span className="w-1 h-1 bg-rose-500 rounded-full"></span>
                {errors.email}
              </p>}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-14 py-4 border-2 rounded-2xl bg-gradient-to-r from-emerald-50/50 to-teal-50/50 focus:from-emerald-100/50 focus:to-teal-100/50 focus:ring-4 focus:ring-emerald-200/50 focus:border-emerald-300 transition-all duration-300 placeholder-slate-400 ${
                    errors.password ? 'border-rose-300 bg-rose-50/50' : 'border-emerald-200'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-400 hover:text-emerald-600 transition-colors p-1 rounded-lg hover:bg-emerald-100/50"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-rose-500 text-sm flex items-center gap-1">
                <span className="w-1 h-1 bg-rose-500 rounded-full"></span>
                {errors.password}
              </p>}
            </div>

            {/* Confirm Password field - only for register */}
            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-400 w-5 h-5" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-14 py-4 border-2 rounded-2xl bg-gradient-to-r from-amber-50/50 to-orange-50/50 focus:from-amber-100/50 focus:to-orange-100/50 focus:ring-4 focus:ring-amber-200/50 focus:border-amber-300 transition-all duration-300 placeholder-slate-400 ${
                      errors.confirmPassword ? 'border-rose-300 bg-rose-50/50' : 'border-amber-200'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-400 hover:text-amber-600 transition-colors p-1 rounded-lg hover:bg-amber-100/50"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-rose-500 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-rose-500 rounded-full"></span>
                  {errors.confirmPassword}
                </p>}
              </div>
            )}

            {/* Forgot Password - only for login */}
            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-purple-600 hover:text-purple-800 transition-colors font-medium hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 text-white py-4 px-6 rounded-2xl font-semibold shadow-xl hover:shadow-2xl focus:ring-4 focus:ring-purple-200/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              <span className="text-lg">{loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}</span>
            </button>
          </form>

          {/* Toggle Form */}
          <div className="text-center pt-6 border-t border-gradient-to-r from-purple-200/30 via-pink-200/30 to-indigo-200/30 relative z-10">
            <p className="text-slate-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={toggleForm}
                className="text-purple-600 hover:text-purple-800 font-semibold transition-colors hover:underline decoration-2 underline-offset-2"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
