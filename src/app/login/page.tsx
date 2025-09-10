'use client';

import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAppStore();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const success = await login(email, password);
      if (success) router.push('/dashboard');
      else setError('Giriş başarısız.');
    } catch (err) {
      setError('Giriş sırasında hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      setIsLoading(false);
      return;
    }
    if (!username || username.length < 3) {
      setError('Kullanıcı adı en az 3 karakter olmalıdır');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register?mode=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, name, password }),
      });
      if (res.ok) {
        router.push('/dashboard');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.message || 'Kayıt olurken bir hata oluştu');
      }
    } catch (err) {
      setError('Kayıt olurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Giriş Yap</CardTitle>
            <CardDescription>Hesabınıza erişin</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input placeholder="E-posta" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input placeholder="Şifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Yükleniyor...' : 'Giriş Yap'}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kayıt Ol</CardTitle>
            <CardDescription>Yeni hesap oluşturun</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <Input placeholder="Ad Soyad" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input placeholder="Kullanıcı Adı" value={username} onChange={(e) => setUsername(e.target.value)} required />
              <Input placeholder="E-posta" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input placeholder="Şifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <Input placeholder="Şifre (Tekrar)" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Yükleniyor...' : 'Kayıt Ol'}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}