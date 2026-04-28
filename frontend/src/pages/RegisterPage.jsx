import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../api/auth/auth.service";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setIsLoading(true);
    try {
      await authService.register(form.name, form.email, form.password);
      const { data } = await authService.login(form.email, form.password);
      login(data.user, data.token);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0A0A0B] text-white overflow-hidden">
      {/* Left Side: 40% (Form) */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center px-8 sm:px-16 lg:px-20 relative bg-[#0A0A0B] z-10 lg:border-r border-white/5">
        <div className="w-full max-w-sm mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-semibold tracking-tight text-lg">DevPulse</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight mb-2">Create an account</h1>
          <p className="text-gray-400 mb-8 text-sm">Start collaborating with your team.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Jane Smith"
                  className="w-full bg-white/[0.03] border border-white/10 text-white placeholder-gray-500 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="name@company.com"
                  className="w-full bg-white/[0.03] border border-white/10 text-white placeholder-gray-500 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-300">Password</label>
                  <span className="text-xs text-gray-500 font-medium">Min. 8 chars</span>
                </div>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/10 text-white placeholder-gray-500 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-md py-2.5 text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {isLoading ? "Creating account..." : "Create account"}
              </button>
            </div>
          </form>

          <p className="text-center text-gray-400 text-sm mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-white hover:text-indigo-400 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side: 60% (Illustration) */}
      <div className="hidden lg:flex flex-col w-[60%] bg-[#111115] relative">
        <div className="flex-1 flex flex-col items-center justify-center p-12">
          <img 
            src="/undraw_team-collaboration_phnf.svg" 
            alt="Collaboration" 
            className="w-full max-w-lg mb-12" 
          />
          <h2 className="text-2xl font-bold tracking-tight mb-2">Power your team's workflow.</h2>
          <p className="text-gray-400 text-center max-w-md text-sm leading-relaxed">
            Create an account to start assigning tasks, tracking progress, and shipping amazing products together.
          </p>
        </div>
      </div>
    </div>
  );
}
