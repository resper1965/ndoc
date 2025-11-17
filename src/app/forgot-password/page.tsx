'use client';

import { useState } from 'react';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { showSuccess, showError } from '@/lib/toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        showError(error.message);
        return;
      }

      setSent(true);
      showSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (error: any) {
      showError(error.message || 'Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Email Enviado
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Verifique sua caixa de entrada. Você receberá um link para redefinir sua senha.
            </p>
            <Link href="/login" className="mt-4 inline-block text-primary-500 hover:text-primary-600">
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
            Recuperar Senha
          </h2>
          <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
            Digite seu email para receber um link de recuperação
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading || !email}
          >
            {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
          </Button>
          <div className="text-center">
            <Link href="/login" className="text-sm text-primary-500 hover:text-primary-600">
              Voltar para o login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

