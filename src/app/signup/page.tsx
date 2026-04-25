"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, User, Loader2, AlertCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) return;
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    setError("");

    const result = await signup({ email, password, name, role: "user" });
    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Signup failed.");
    }
    setLoading(false);
  }

  return (
    <>
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-gray-900">Create an Account</h1>
          <p className="text-gray-500 text-sm mt-2">Join AnyVendor to save favourites and plan events</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div>
              <label className="block text-gray-600 text-xs font-semibold mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-[#e2b33e] focus:outline-none" placeholder="Your name" />
              </div>
            </div>

            <div>
              <label className="block text-gray-600 text-xs font-semibold mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-[#e2b33e] focus:outline-none" placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-gray-600 text-xs font-semibold mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-[#e2b33e] focus:outline-none" placeholder="Minimum 6 characters" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a1a2e] hover:bg-[#16213e] text-white font-bold text-sm py-3.5 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">
              Already have an account?{" "}
              <Link href="/login" className="text-[#e2b33e] font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
