'use client';
import { Github } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/button';
import { motion } from 'framer-motion';
import { clientBranding, getDisplayLogo } from '../../config/branding';
import { BrandingText } from '@/components/branding-text';

export default function Home() {

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {getDisplayLogo() ? (
              <Image
                alt="logo"
                className="h-8 w-auto dark:invert"
                width={32}
                height={32}
                src={getDisplayLogo()!}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : null}
            <BrandingText className="text-lg" />
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#recursos" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
              Recursos
            </a>
            <a href="#precos" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
              Preços
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="outline"
                className="hidden sm:flex"
              >
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                variant="primary"
              >
                Começar Grátis
              </Button>
            </Link>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col justify-center items-center px-4 py-4 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto flex flex-col items-center max-w-6xl"
        >
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex gap-2 lg:gap-4 justify-center items-center xs:px-2"
            >
              {getDisplayLogo() ? (
                <Image
                  alt="logo"
                  className="h-auto w-auto dark:invert"
                  width={100}
                  height={100}
                  src={getDisplayLogo()!}
                  onError={(e) => {
                    // Fallback: esconder imagem se não carregar
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : null}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white font-heading text-center">
                Documentação Inteligente<br />para Sua Equipe
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center"
            >
              Crie, gerencie e publique documentação técnica com IA. 
              <br className="hidden md:block" />
              Colaboração em equipe, editor avançado e muito mais.
            </motion.p>
          </div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 mt-10 justify-center items-center"
          >
            <Link href="/signup">
              <Button
                className="px-8 py-6 text-lg"
                variant={'primary'}
                size={'lg'}
              >
                Começar Grátis
              </Button>
            </Link>
          </motion.div>
          
          {/* Trust indicators */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-6 text-sm text-gray-500 dark:text-gray-400"
          >
            Sem cartão de crédito • Setup em 2 minutos • Cancelamento a qualquer momento
          </motion.p>
        </motion.div>

        {/* Features Section */}
        <section id="recursos" className="container mx-auto px-4 py-16 mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Recursos Poderosos
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Tudo que você precisa para criar e gerenciar documentação técnica de forma eficiente
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">IA Integrada</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Gere e melhore documentação automaticamente com inteligência artificial
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Editor Avançado</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Crie e edite documentos com um editor moderno e intuitivo
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Colaboração</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Trabalhe em equipe com controle de acesso e versionamento
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="precos" className="container mx-auto px-4 py-16 bg-gray-50 dark:bg-gray-900">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Planos Simples
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Escolha o plano ideal para sua equipe
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Grátis</h3>
              <p className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">R$ 0<span className="text-lg">/mês</span></p>
              <ul className="space-y-2 mb-6 text-gray-600 dark:text-gray-400">
                <li>✓ Até 10 documentos</li>
                <li>✓ 1 usuário</li>
                <li>✓ 100MB de armazenamento</li>
              </ul>
              <Link href="/signup">
                <Button variant="outline" className="w-full">
                  Começar Grátis
                </Button>
              </Link>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border-2 border-primary-500 dark:border-primary-500">
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Pro</h3>
              <p className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">R$ 49<span className="text-lg">/mês</span></p>
              <ul className="space-y-2 mb-6 text-gray-600 dark:text-gray-400">
                <li>✓ Documentos ilimitados</li>
                <li>✓ Até 10 usuários</li>
                <li>✓ 10GB de armazenamento</li>
                <li>✓ IA integrada</li>
              </ul>
              <Link href="/signup">
                <Button variant="primary" className="w-full">
                  Assinar Pro
                </Button>
              </Link>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Enterprise</h3>
              <ul className="space-y-2 mb-6 text-gray-600 dark:text-gray-400 mt-8">
                <li>✓ Tudo do Pro</li>
                <li>✓ Usuários ilimitados</li>
                <li>✓ Armazenamento ilimitado</li>
                <li>✓ Suporte prioritário</li>
              </ul>
              <Link href="/signup">
                <Button variant="outline" className="w-full">
                  Contatar Vendas
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                {getDisplayLogo() ? (
                  <Image
                    alt="logo"
                    className="h-6 w-auto dark:invert"
                    width={24}
                    height={24}
                    src={getDisplayLogo()!}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}
                <BrandingText className="font-semibold" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Plataforma de documentação inteligente para equipes modernas.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                powered by <BrandingText variant="producer" className="text-xs" />
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#recursos" className="hover:text-gray-900 dark:hover:text-gray-100">Recursos</a></li>
                <li><a href="#precos" className="hover:text-gray-900 dark:hover:text-gray-100">Preços</a></li>
                <li><a href="/signup" className="hover:text-gray-900 dark:hover:text-gray-100">Começar Grátis</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-100">Sobre</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-100">Blog</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-100">Contato</a></li>
                {clientBranding.github && (
                  <li>
                    <a 
                      href={clientBranding.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-500">
            <p>© {new Date().getFullYear()} <BrandingText className="text-sm" />. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
