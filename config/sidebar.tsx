import { generateSidebar } from '@/lib/generate-sidebar';

// Sidebar gerada automaticamente a partir da estrutura docs/
// Para customizar, você pode:
// 1. Adicionar campo 'order' no frontmatter dos MDX para ordenar
// 2. Usar nomes de diretórios que correspondem aos ícones pré-configurados
// 3. Ou editar manualmente abaixo e desabilitar a geração automática

// Geração automática (padrão)
export const sidebarNav = generateSidebar();

// Para usar sidebar manual, descomente e edite:
// export const sidebarNav = [
//   {
//     title: 'Primeiros Passos',
//     icon: <Rocket className="h-5 w-5" />,
//     defaultOpen: true,
//     pages: [
//       {
//         title: 'Bem-vindo',
//         href: '/docs',
//       },
//     ],
//   },
// ];
