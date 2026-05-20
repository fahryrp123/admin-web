import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Lock, Mail, ArrowLeft } from "lucide-react";
import { useApp } from "../context/AppContext";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const returnTo = (location.state as any)?.returnTo || "/home";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const success = login(email, password);
    if (success) {
      navigate(returnTo);
    } else {
      setError("Email atau password salah. Gunakan email apapun untuk demo.");
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <div className="bg-primary text-primary-foreground px-6 py-6">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-lg mb-4">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold mb-2">SEWAMOBILYUK</h1>
        <p className="text-sm opacity-90">Login untuk melanjutkan</p>
      </div>

      <div className="flex-1 px-6 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6 text-center">Welcome Back</h2>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm mb-2 text-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-md"
              >
                Sign In
              </button>
            </form>

            <div className="mt-4 text-center">
              <button className="text-sm text-primary hover:underline">
                Forgot Password?
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Don't have an account?
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="text-primary font-medium hover:underline"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
