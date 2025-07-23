"use client";

import { useState } from 'react';
import { Mail, Lock, Save, X } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function AccountSettings() {
  const { user } = useAuth();

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const validateEmail = () => {
    if (!email) {
        setErrors(prev => ({ ...prev, email: 'Email tidak boleh kosong' }));
        return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Email tidak valid' }));
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    const newErrors = { ...errors };
    let isValid = true;

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Password saat ini diperlukan';
      isValid = false;
    }
    if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password baru minimal 8 karakter';
      isValid = false;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleUpdateEmail = async () => {
    if (!validateEmail()) return;
    
    setIsSavingEmail(true);
    try {
      const response = await fetch('/api/auth/update-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert('Email berhasil diperbarui! Silakan login kembali untuk melihat perubahan email.');
        setIsEditingEmail(false);
        setEmail('');
        // Force a session update or sign out
        window.location.reload();
      } else {
        const errorText = await response.text();
        alert(`Gagal memperbarui email: ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating email:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!validatePassword()) return;

    setIsSavingPassword(true);
    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData),
      });

      if (response.ok) {
        alert('Password berhasil diperbarui! Silahkan login kembali untuk melihat perubahan.');
        setIsEditingPassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const errorText = await response.text();
        alert(`Gagal memperbarui password: ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Change Email Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Ganti Alamat Email</h3>
          {!isEditingEmail ? (
            <button onClick={() => setIsEditingEmail(true)} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm">
              Ganti Email
            </button>
          ) : (
            <button onClick={() => { setIsEditingEmail(false); setEmail(''); setErrors(p => ({...p, email: ''})) }} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors flex items-center text-sm">
              <X size={16} className="mr-1" /> Batal
            </button>
          )}
        </div>
        {isEditingEmail && (
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Baru</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder={user?.email || 'email@example.com'}
                  className="pl-10 w-full py-2 px-4 border rounded-lg"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <button onClick={handleUpdateEmail} disabled={isSavingEmail} className={`w-full py-2 px-4 rounded-lg font-medium flex justify-center items-center ${isSavingEmail ? 'bg-gray-300' : 'bg-emerald-500 text-white'}`}>
              {isSavingEmail ? 'Menyimpan...' : 'Simpan Email'}
            </button>
          </div>
        )}
      </div>

      {/* Change Password Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Ganti Password</h3>
          {!isEditingPassword ? (
            <button onClick={() => setIsEditingPassword(true)} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm">
              Ganti Password
            </button>
          ) : (
            <button onClick={() => { setIsEditingPassword(false); setPasswordData({currentPassword: '', newPassword: '', confirmPassword: ''}); setErrors(p => ({...p, currentPassword: '', newPassword: '', confirmPassword: ''}))}} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors flex items-center text-sm">
              <X size={16} className="mr-1" /> Batal
            </button>
          )}
        </div>
        {isEditingPassword && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordInputChange} className="pl-10 w-full py-2 px-4 border rounded-lg" />
              </div>
              {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordInputChange} className="pl-10 w-full py-2 px-4 border rounded-lg" />
              </div>
              {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordInputChange} className="pl-10 w-full py-2 px-4 border rounded-lg" />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
            <button onClick={handleUpdatePassword} disabled={isSavingPassword} className={`w-full py-2 px-4 rounded-lg font-medium flex justify-center items-center ${isSavingPassword ? 'bg-gray-300' : 'bg-emerald-500 text-white'}`}>
              {isSavingPassword ? 'Menyimpan...' : 'Simpan Password'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}