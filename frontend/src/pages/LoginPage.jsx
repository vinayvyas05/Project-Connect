import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../api/auth/auth.service";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const { data } = await authService.login(form.email, form.password);
      login(data.user, data.accessToken || data.token, data.refreshToken);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background text-text-primary overflow-hidden">
      {/* Left Side: 60% (Illustration) */}
      <div className="hidden lg:flex flex-col w-[60%] bg-surface border-r border-gray-200 relative">
        <div className="p-8 absolute top-0 left-0 w-full">
          <div className="flex items-center gap-2">
            <img src="/devpulse.svg" alt="DevPulse Logo" className="w-8 h-8 rounded" />
            <span className="font-semibold tracking-tight text-lg text-text-primary">DevPulse</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-12 mt-12">
          <img 
            src="/undraw_dev-productivity_5wps.svg" 
            alt="Productivity" 
            className="w-full max-w-md mb-10" 
          />
          <h2 className="text-2xl font-bold tracking-tight mb-2 text-text-primary">Build faster, together.</h2>
          <p className="text-text-secondary text-center max-w-sm text-sm leading-relaxed">
            Join your team to manage projects, tasks, and communication all in one centralized platform.
          </p>
        </div>
      </div>

      {/* Right Side: 40% (Form) */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center px-8 sm:px-16 lg:px-20 relative">
        <div className="w-full max-w-sm mx-auto">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <img src="/devpulse.svg" alt="DevPulse Logo" className="w-8 h-8 rounded" />
            <span className="font-semibold tracking-tight text-lg text-text-primary">DevPulse</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight mb-2 text-text-primary">Welcome back</h1>
          <p className="text-text-secondary mb-8 text-sm">Please enter your details to sign in.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-error bg-error/10 border border-error/20 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="name@company.com"
                  className="w-full bg-gray-50 border border-gray-200 text-text-primary placeholder-gray-400 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-text-primary">Password</label>
                  <a href="#" className="text-xs font-medium text-primary hover:text-primary-hover transition-colors">Forgot password?</a>
                </div>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200 text-text-primary placeholder-gray-400 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-hover text-white font-medium rounded-md py-2.5 text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          <p className="text-center text-text-secondary text-sm mt-8">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-primary hover:text-primary-hover font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
