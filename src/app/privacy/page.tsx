'use client';

import { getDisplayName } from '../../../config/branding';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introdução</h2>
            <p>
              Esta Política de Privacidade descreve como {getDisplayName()} coleta, usa, armazena e protege suas
              informações pessoais. Levamos sua privacidade a sério e estamos comprometidos em proteger seus dados.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Informações que Coletamos</h2>

            <h3 className="text-xl font-semibold mb-2 mt-4">2.1 Informações de Conta</h3>
            <ul className="list-disc pl-6 mt-2">
              <li>Nome completo</li>
              <li>Endereço de email</li>
              <li>Senha (armazenada de forma criptografada)</li>
              <li>Informações da organização</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">2.2 Conteúdo do Usuário</h3>
            <ul className="list-disc pl-6 mt-2">
              <li>Documentos criados e editados</li>
              <li>Configurações de IA e temas</li>
              <li>Comentários e interações</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">2.3 Dados de Uso</h3>
            <ul className="list-disc pl-6 mt-2">
              <li>Logs de acesso e atividade</li>
              <li>Endereço IP</li>
              <li>User Agent e tipo de navegador</li>
              <li>Páginas visitadas e tempo de uso</li>
              <li>Métricas de performance</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">2.4 Informações de Pagamento</h3>
            <ul className="list-disc pl-6 mt-2">
              <li>Informações de cobrança (processadas via Stripe)</li>
              <li>Histórico de transações</li>
              <li>Nota: Não armazenamos dados de cartão de crédito diretamente</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Como Usamos Suas Informações</h2>
            <p>Usamos suas informações para:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Fornecer e melhorar nossos serviços</li>
              <li>Processar pagamentos e gerenciar assinaturas</li>
              <li>Autenticar usuários e prevenir fraudes</li>
              <li>Enviar notificações importantes sobre sua conta</li>
              <li>Processar requisições de IA para geração de conteúdo</li>
              <li>Analisar uso e melhorar a experiência do usuário</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Compartilhamento de Dados</h2>
            <p>Não vendemos suas informações pessoais. Podemos compartilhar dados apenas com:</p>

            <h3 className="text-xl font-semibold mb-2 mt-4">4.1 Provedores de Serviço</h3>
            <ul className="list-disc pl-6 mt-2">
              <li><strong>Supabase:</strong> Hospedagem de banco de dados e autenticação</li>
              <li><strong>Vercel:</strong> Hospedagem da aplicação</li>
              <li><strong>Stripe:</strong> Processamento de pagamentos</li>
              <li><strong>OpenAI/Anthropic:</strong> Processamento de requisições de IA</li>
              <li><strong>Upstash:</strong> Rate limiting e cache</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">4.2 Requisitos Legais</h3>
            <p>
              Podemos divulgar informações se exigido por lei, ordem judicial ou processo legal, ou para proteger
              nossos direitos legais.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">4.3 Membros da Organização</h3>
            <p>
              Conteúdo criado dentro de uma organização é acessível a outros membros conforme as permissões definidas.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Armazenamento e Segurança</h2>

            <h3 className="text-xl font-semibold mb-2 mt-4">5.1 Localização dos Dados</h3>
            <p>
              Seus dados são armazenados em servidores seguros fornecidos por Supabase (AWS) em regiões geograficamente
              distribuídas.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">5.2 Medidas de Segurança</h3>
            <ul className="list-disc pl-6 mt-2">
              <li>Criptografia de dados em trânsito (HTTPS/TLS)</li>
              <li>Criptografia de dados em repouso</li>
              <li>Senhas com hash bcrypt</li>
              <li>Row Level Security (RLS) no banco de dados</li>
              <li>Rate limiting para prevenir abuso</li>
              <li>Logs de auditoria para rastreamento de ações</li>
              <li>Autenticação de dois fatores (2FA) disponível</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">5.3 Retenção de Dados</h3>
            <p>
              Mantemos seus dados enquanto sua conta estiver ativa. Após o cancelamento, seus dados serão retidos por
              30 dias para permitir reativação, e então serão permanentemente deletados.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Seus Direitos</h2>
            <p>Você tem o direito de:</p>
            <ul className="list-disc pl-6 mt-2">
              <li><strong>Acessar:</strong> Solicitar cópia de seus dados pessoais</li>
              <li><strong>Corrigir:</strong> Atualizar informações imprecisas</li>
              <li><strong>Excluir:</strong> Solicitar remoção de seus dados (direito ao esquecimento)</li>
              <li><strong>Exportar:</strong> Receber seus dados em formato portável</li>
              <li><strong>Restringir:</strong> Limitar o processamento de seus dados</li>
              <li><strong>Opor-se:</strong> Rejeitar certos usos de seus dados</li>
            </ul>
            <p className="mt-4">
              Para exercer esses direitos, entre em contato através do suporte da plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Cookies e Tecnologias Similares</h2>
            <p>Usamos cookies e tecnologias similares para:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Manter sua sessão autenticada</li>
              <li>Lembrar preferências (tema, idioma)</li>
              <li>Analisar uso da plataforma</li>
              <li>Prevenir fraude e abuso</li>
            </ul>
            <p className="mt-4">
              Você pode controlar cookies através das configurações do seu navegador.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Uso de IA e Processamento</h2>
            <p>
              Quando você usa recursos de IA (geração e melhoria de documentos):
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Seu conteúdo é enviado para provedores de IA (OpenAI/Anthropic)</li>
              <li>Os provedores processam o conteúdo conforme suas próprias políticas</li>
              <li>Não armazenamos API keys em texto plano</li>
              <li>Você pode optar por não usar recursos de IA a qualquer momento</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Menores de Idade</h2>
            <p>
              Nosso serviço não é destinado a menores de 18 anos. Não coletamos intencionalmente informações de
              menores. Se tomarmos conhecimento de coleta inadvertida, deletaremos imediatamente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. LGPD e Conformidade</h2>
            <p>
              Estamos comprometidos em cumprir a Lei Geral de Proteção de Dados (LGPD) do Brasil e outras leis
              aplicáveis de proteção de dados.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas por email
              ou através de aviso na plataforma. O uso continuado após mudanças constitui aceitação da nova política.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Contato</h2>
            <p>
              Para questões sobre privacidade, proteção de dados ou exercer seus direitos, entre em contato através
              do suporte da plataforma ou email de privacidade.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <a
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Voltar para a página inicial
          </a>
        </div>
      </div>
    </div>
  );
}
