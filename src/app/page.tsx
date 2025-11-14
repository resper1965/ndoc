'use client';
import { Github } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import Image from 'next/image';
import { Button } from '@/components/button';
import { motion } from 'framer-motion';
import { clientBranding, producerBranding, getDisplayName, getDisplayLogo } from '../../config/branding';

export default function Home() {

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
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
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {getDisplayName().charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-lg font-semibold">{getDisplayName()}</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
              Features
            </a>
            <a href="#pricing" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
              Pricing
            </a>
            <a href="/docs" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
              Docs
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/login'}
              className="hidden sm:flex"
            >
              Login
            </Button>
            <Button
              variant="primary"
              onClick={() => window.location.href = '/signup'}
            >
              Começar Grátis
            </Button>
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
              ) : (
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-2xl md:text-4xl font-bold text-white">
                    {getDisplayName().charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
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
            <Button
              className="px-8 py-6 text-lg"
              variant={'primary'}
              onClick={() => window.location.href = '/signup'}
              size={'lg'}
            >
              Começar Grátis
            </Button>
            <Button
              className="px-8 py-6 text-lg"
              variant={'outline'}
              size={'lg'}
              onClick={() => window.location.href = '/docs'}
            >
              Ver Documentação
            </Button>
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
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {getDisplayName().charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="font-semibold">{getDisplayName()}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Plataforma de documentação inteligente para equipes modernas.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {producerBranding.footerText}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#features" className="hover:text-gray-900 dark:hover:text-gray-100">Features</a></li>
                <li><a href="#pricing" className="hover:text-gray-900 dark:hover:text-gray-100">Pricing</a></li>
                <li><a href="/docs" className="hover:text-gray-900 dark:hover:text-gray-100">Documentação</a></li>
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
            <p>© {new Date().getFullYear()} {getDisplayName()}. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
