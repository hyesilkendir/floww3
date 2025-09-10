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

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const success = await login(loginEmail, loginPassword);
      if (success) router.push('/dashboard');
      else setLoginError('Giriş başarısız.');
    } catch {
      setLoginError('Giriş sırasında hata oluştu');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError('');

    if (regPassword !== regConfirm) {
      setRegError('Şifreler eşleşmiyor');
      setRegLoading(false);
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Şifre en az 6 karakter olmalıdır');
      setRegLoading(false);
      return;
    }
    if (!regUsername || regUsername.length < 3) {
      setRegError('Kullanıcı adı en az 3 karakter olmalıdır');
      setRegLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register?mode=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, username: regUsername, name: regName, password: regPassword }),
      });
      if (res.ok) {
        router.push('/dashboard');
      } else {
        const data = await res.json().catch(() => ({}));
        setRegError(data?.message || 'Kayıt olurken bir hata oluştu');
      }
    } catch {
      setRegError('Kayıt olurken bir hata oluştu');
    } finally {
      setRegLoading(false);
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
              <Input placeholder="E-posta" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
              <Input placeholder="Şifre" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
              {loginError && <div className="text-red-600 text-sm">{loginError}</div>}
              <Button type="submit" disabled={loginLoading}>{loginLoading ? 'Yükleniyor...' : 'Giriş Yap'}</Button>
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
              <Input placeholder="Ad Soyad" value={regName} onChange={(e) => setRegName(e.target.value)} required />
              <Input placeholder="Kullanıcı Adı" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} required />
              <Input placeholder="E-posta" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
              <Input placeholder="Şifre" type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
              <Input placeholder="Şifre (Tekrar)" type="password" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} required />
              {regError && <div className="text-red-600 text-sm">{regError}</div>}
              <Button type="submit" disabled={regLoading}>{regLoading ? 'Yükleniyor...' : 'Kayıt Ol'}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}