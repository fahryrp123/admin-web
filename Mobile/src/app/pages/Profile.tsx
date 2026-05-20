import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Mail, Phone, MapPin, Calendar, LogOut, Edit2 } from "lucide-react";
import { useApp } from "../context/AppContext";

export function Profile() {
  const navigate = useNavigate();
  const { currentUser, logout } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin logout?")) {
      logout();
      navigate("/home");
    }
  };

  const handleLogin = () => {
    navigate("/login", { state: { returnTo: "/home/profile" } });
  };

  const handleSave = () => {
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  if (!isLoggedIn) {
    return (
      <div className="px-6 py-6">
        <h2 className="text-2xl font-bold mb-6">Profile</h2>
        <div className="bg-card rounded-2xl shadow-md p-8 text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-muted-foreground" size={48} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Belum Login</h3>
          <p className="text-muted-foreground mb-6">
            Login untuk mengakses profil dan riwayat rental Anda
          </p>
          <button
            onClick={handleLogin}
            className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Login Sekarang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      <h2 className="text-2xl font-bold mb-6">Profile</h2>

      <div className="bg-card rounded-2xl shadow-md p-6 mb-6">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
            <User className="text-primary-foreground" size={48} />
          </div>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold mb-1">{currentUser?.name}</h3>
          <p className="text-sm text-muted-foreground">
            Member since {currentUser?.memberSince ? new Date(currentUser.memberSince).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' }) : ''}
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="w-full mb-4 bg-muted text-foreground py-3 rounded-xl font-medium hover:bg-accent transition-colors flex items-center justify-center gap-2"
        >
          <Edit2 size={18} />
          {isEditing ? "Cancel Edit" : "Edit Profile"}
        </button>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-muted rounded-xl">
            <Mail className="text-primary mt-1" size={20} />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              <p className="text-sm font-medium">{currentUser?.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-muted rounded-xl">
            <Phone className="text-primary mt-1" size={20} />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Phone</p>
              <p className="text-sm font-medium">{currentUser?.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-muted rounded-xl">
            <MapPin className="text-primary mt-1" size={20} />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Address</p>
              <p className="text-sm font-medium">{currentUser?.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-muted rounded-xl">
            <Calendar className="text-primary mt-1" size={20} />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Member Since</p>
              <p className="text-sm font-medium">
                {currentUser?.memberSince ? new Date(currentUser.memberSince).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : '-'}
              </p>
            </div>
          </div>
        </div>

        {isEditing && (
          <button
            onClick={handleSave}
            className="w-full mt-4 bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Save Changes
          </button>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="w-full bg-destructive text-destructive-foreground py-3 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-2"
      >
        <LogOut size={20} />
        Logout
      </button>
    </div>
  );
}
