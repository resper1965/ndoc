'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { createClient } from '@/lib/supabase/client';
import { showSuccess, showError } from '@/lib/toast';
import { logger } from '@/lib/logger';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { getDisplayName, getDisplayLogo } from '../../../config/branding';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        showError(error.message || 'Erro ao enviar email de recuperação');
        setLoading(false);
        return;
      }

      setEmailSent(true);
      showSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (error) {
      logger.error('Forgot password error', error);
      showError('Erro inesperado ao enviar email de recuperação');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {getDisplayLogo() ? (
              <img
                src={getDisplayLogo()!}
                alt={getDisplayName()}
                className="h-12 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
                <span className="text-xl font-bold text-white">
                  {getDisplayName().charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Recuperar senha
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {emailSent 
              ? 'Verifique sua caixa de entrada para redefinir sua senha'
              : 'Digite seu email para receber instruções de recuperação'
            }
          </p>
        </div>

        {/* Card de Recuperação */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 p-8">
          {emailSent ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Email enviado!</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Enviamos um link de recuperação para <strong>{email}</strong>
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                  Verifique sua caixa de entrada e spam. O link expira em 1 hora.
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                >
                  Enviar para outro email
                </Button>
                <Link href="/login" className="block">
                  <Button variant="primary" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                    disabled={loading}
                    autoFocus
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Botão de Enviar */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !email}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar link de recuperação'
                )}
              </Button>
            </form>
          )}

          {/* Links adicionais */}
          <div className="mt-6 text-center text-sm">
            <Link
              href="/login"
              className="text-primary hover:underline flex items-center justify-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Voltar para login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          <p>
            Não tem uma conta?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
