import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Lock, Mail, User, Phone, ArrowLeft } from "lucide-react";
import { useApp } from "../context/AppContext";

export function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useApp();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
  });

  const returnTo = (location.state as any)?.returnTo || "/home";

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Password tidak cocok!");
      return;
    }

    register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
    });

    navigate(returnTo);
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <div className="bg-primary text-primary-foreground px-6 py-6">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-lg mb-4">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold mb-2">SEWAMOBILYUK</h1>
        <p className="text-sm opacity-90">Daftar untuk melanjutkan</p>
      </div>

      <div className="flex-1 px-6 py-8 overflow-auto">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6 text-center">Sign Up</h2>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-foreground">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-foreground">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+62 812 3456 7890"
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
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-foreground">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-md"
              >
                Create Account
              </button>
            </form>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Already have an account?
            </p>
            <button
              onClick={() => navigate("/login")}
              className="text-primary font-medium hover:underline"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
