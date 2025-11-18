// src/app/doc/layout.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { SemanticSearchDialog } from '@/components/semantic-search-dialog';
import { DynamicSidebar } from '@/components/dynamic-sidebar';
import Image from 'next/image';
import {
  SidebarProvider,
  SidebarLayout,
  MainContent,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarHeaderLogo,
  SidebarHeaderTitle,
  UserAvatar,
} from '@/components/sidebar';
import { Github, Home, Settings, Shield } from 'lucide-react';

import Header from '@/components/header';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { clientBranding, getDisplayName, getDisplayLogo } from '../../../config/branding';
import { BrandingText } from '@/components/branding-text';
import { DocsActions } from '@/components/docs-actions';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  return (
    <SidebarLayout>
      {/* Left Sidebar Provider */}
      <SidebarProvider
        defaultOpen={isMobile ? false : true}
        defaultSide="left"
        defaultMaxWidth={280}
        showIconsOnCollapse={true}
      >
        <Sidebar>
          <SidebarHeader>
              <SidebarHeaderLogo
                logo={
                  getDisplayLogo() ? (
                    <Image
                      alt="logo"
                      className={'h-auto w-aut dark:invert'}
                      width={100}
                      height={100}
                      src={getDisplayLogo()!}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {getDisplayName().charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )
                }
              />

            <Link href={'/'} className="flex flex-1 gap-3">
              <SidebarHeaderTitle className="font-heading">
                {getDisplayName()}
              </SidebarHeaderTitle>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <DynamicSidebar />
          </SidebarContent>

          <SidebarFooter>
                 <UserAvatar>
                   {getDisplayLogo() ? (
                     <Image
                       alt="logo"
                       src={getDisplayLogo()!}
                       width={100}
                       height={100}
                     />
                   ) : (
                     <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
                       <span className="text-sm font-bold text-white">
                         {getDisplayName().charAt(0).toUpperCase()}
                       </span>
                     </div>
                   )}
                 </UserAvatar>
            <div className="flex flex-col">
              <BrandingText className="text-sm" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {clientBranding.tagline || 'Documentação'}
              </span>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <MainContent>
          <Header className="justify-between py-2">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-bold">Documentação</h1>
            </div>
            <div className="flex gap-2 items-center pr-0 lg:pr-8">
              <DocsActions />
              <Link href="/">
                <Button variant="none" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Início</span>
                </Button>
              </Link>
              <Link href="/config">
                <Button variant="none" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Configurações</span>
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="none" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              </Link>
              <SemanticSearchDialog />
              <ModeToggle />
              {clientBranding.github && (
                <Button
                  onClick={() => window.open(clientBranding.github, '_blank')}
                  variant="none"
                >
                  <Github className="h-[1.2rem] w-[1.2rem] transition-all" />
                </Button>
              )}
            </div>
          </Header>
          {/* <div className={`grid xl:grid xl:grid-cols-[1fr_270px]`}> */}
          <main className="overflow-auto p-6">{children}</main>
        </MainContent>
      </SidebarProvider>

      {/* Right Sidebar Provider */}
      {/* <SidebarProvider defaultOpen={false} defaultSide="right" defaultMaxWidth={300} showIconsOnCollapse={true}>
        <Sidebar>
          <SidebarHeader>
            <SidebarTrigger />
            <Title>Documentation</Title>
            <BookOpen className="h-5 w-5" />
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem icon={<BookOpen className="h-5 w-5" />} label="Getting Started" href="/docs/getting-started" />
              <SidebarMenuItem icon={<Settings className="h-5 w-5" />} label="Configuration" href="/docs/configuration" />
              <SidebarMenuItem icon={<FileText className="h-5 w-5" />} label="API Reference" defaultOpen={true}>
                <NestedLink href="/docs/api/overview">Overview</NestedLink>
                <NestedLink href="/docs/api/endpoints">Endpoints</NestedLink>
                <NestedLink href="/docs/api/authentication">Authentication</NestedLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter>
            <div className="text-sm text-gray-500">v1.0.0</div>
          </SidebarFooter>
        </Sidebar>
      </SidebarProvider> */}
    </SidebarLayout>
  );
}
