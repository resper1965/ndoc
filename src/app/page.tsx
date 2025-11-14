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
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex-1">{/* Empty space for layout balance */}</div>
          <nav className="flex-1 flex justify-center">
            {/* Navigation links can be added here */}
          </nav>
          <div className="flex-1 flex gap-2 justify-end">
            <ModeToggle />
            {clientBranding.github && (
              <Button
                onClick={() => window.open(clientBranding.github, '_blank')}
              >
                <Github className="h-[1.2rem] w-[1.2rem] transition-all" />
              </Button>
            )}
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
              <h1 className="text-5xl content-center md:text-7xl font-stretch-110% -tracking-tighter text-gray-900 dark:text-white font-heading">
                {getDisplayName()}
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-shadow-xs mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              {clientBranding.tagline || clientBranding.description || 
                'Plataforma de documentação inteligente desenvolvida pela ness. Crie, gerencie e publique documentação técnica com suporte a IA.'}
            </motion.p>
          </div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-row sm:flex-row gap-4 mt-8"
          >
            <Button
              className="px-6 py-3"
              variant={'primary'}
              onClick={() => window.location.href = '/docs'}
              size={'md'}
            >
              Get Started
            </Button>
            {clientBranding.github && (
              <Button
                className="px-6 py-3 gap-2"
                variant={'outline'}
                size={'md'}
                onClick={() => window.open(clientBranding.github, '_blank')}
              >
                <Github size={20} />
                GitHub
              </Button>
            )}
          </motion.div>
        </motion.div>
      </main>

      {/* Sticky Footer */}
      <footer className="sticky bottom-0 z-10 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-3 text-center text-gray-600 dark:text-gray-400">
          <div className="flex justify-end items-center space-x-4">
              <Button
              className="px-4 py-2 text-sm font-medium gap-2"
              onClick={() =>
                window.open(
                  'https://vercel.com/new/clone?repository-url=https://github.com/resper1965/ndoc',
                  '_blank'
                )
              }
            >
              <Image
                src={'/logos/vercel.png'}
                height={'20'}
                width={'20'}
                alt={'Deploy Vercel'}
                className={'dark:invert'}
              />
              <span>Deploy to Vercel</span>
            </Button>
            <div className="flex text-sm text-right gap-3">
              <p>
                {producerBranding.footerText}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
