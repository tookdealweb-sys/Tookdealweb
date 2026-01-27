"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { GoogleLogin } from "@react-oauth/google";

export default function TookDealSignup() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlesigin = () => {
    window.location.href = "/login";
  };

  // ✅ Supabase Email Signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);
    setError("");

    const { email, password, fullName, phone } = formData;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { fullName, phone }, // Custom user metadata
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      alert("Signup successful! Please verify your email.");
      window.location.href = "/login";
    }
  };

  // ✅ Supabase Google Login
  

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-900">
        <img
          className="absolute inset-0 w-full h-full object-cover opacity-90 dark:opacity-70"
          src="./images/Rectangle 2756.png"
          alt="Man using smartphone"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#00d4ad]/20 to-transparent"></div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img
              className="h-10 w-auto object-contain mx-auto"
              src="./images/Frame 1.png"
              alt="TookDeal Logo"
            />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Get Your Shop Online in Minutes
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Full name"
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-zinc-500 rounded-lg focus:ring-2 focus:ring-[#00d4ad] outline-none"
            />

            {/* Email */}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-zinc-500 rounded-lg focus:ring-2 focus:ring-[#00d4ad] outline-none"
            />

            {/* Phone */}
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Phone number"
              className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-zinc-500 rounded-lg focus:ring-2 focus:ring-[#00d4ad] outline-none"
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                required
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-zinc-500 rounded-lg focus:ring-2 focus:ring-[#00d4ad] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-zinc-400 hover:text-[#00d4ad]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm Password"
                required
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-zinc-500 rounded-lg focus:ring-2 focus:ring-[#00d4ad] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-zinc-400 hover:text-[#00d4ad]"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00d4ad] text-white py-3 rounded-lg font-semibold hover:bg-[#00b89a] transition-colors shadow-lg shadow-[#00d4ad]/20 disabled:opacity-50"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          {/* Google Login */}
          
          {/* Already have account */}
          <p className="text-center mt-6 text-gray-600 dark:text-zinc-400 text-sm">
            Already have an account?{" "}
            <button
              onClick={handlesigin}
              className="text-[#00d4ad] hover:text-[#00b89a] font-medium"
            >
              Sign In
            </button>
          </p>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-500 dark:text-red-400 text-center text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}