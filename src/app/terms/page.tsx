'use client';

import { getDisplayName } from '../../../config/branding';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Termos de Serviço</h1>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar o {getDisplayName()}, você concorda em cumprir e estar vinculado a estes Termos de Serviço.
              Se você não concordar com qualquer parte destes termos, não deve usar nossa plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Descrição do Serviço</h2>
            <p>
              {getDisplayName()} é uma plataforma SaaS de gestão de documentos que oferece:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Criação e edição de documentos em formato MDX</li>
              <li>Geração e melhoria de documentos usando Inteligência Artificial</li>
              <li>Colaboração em equipe com controle de acesso baseado em roles</li>
              <li>Versionamento e histórico de documentos</li>
              <li>Recursos adicionais conforme o plano contratado</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Contas de Usuário</h2>
            <h3 className="text-xl font-semibold mb-2 mt-4">3.1 Registro</h3>
            <p>
              Para usar nossa plataforma, você deve criar uma conta fornecendo informações precisas e completas.
              Você é responsável por manter a confidencialidade de suas credenciais de acesso.
            </p>
            <h3 className="text-xl font-semibold mb-2 mt-4">3.2 Organizações</h3>
            <p>
              Ao se registrar, uma organização será criada automaticamente para você. Você pode convidar outros usuários
              para sua organização e atribuir roles apropriados.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Planos e Pagamentos</h2>
            <h3 className="text-xl font-semibold mb-2 mt-4">4.1 Planos Disponíveis</h3>
            <p>
              Oferecemos diferentes planos (Free, Starter, Professional, Enterprise) com limites e recursos específicos.
              Os detalhes de cada plano estão disponíveis em nossa página de preços.
            </p>
            <h3 className="text-xl font-semibold mb-2 mt-4">4.2 Pagamentos</h3>
            <p>
              Os pagamentos são processados através de provedores terceiros seguros (Stripe). Você concorda em fornecer
              informações de pagamento precisas e autorizadas.
            </p>
            <h3 className="text-xl font-semibold mb-2 mt-4">4.3 Renovação e Cancelamento</h3>
            <p>
              As assinaturas são renovadas automaticamente ao final de cada período de cobrança. Você pode cancelar
              sua assinatura a qualquer momento através das configurações da conta.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Uso Aceitável</h2>
            <p>Você concorda em NÃO:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Usar a plataforma para fins ilegais ou não autorizados</li>
              <li>Tentar obter acesso não autorizado a sistemas ou contas</li>
              <li>Interferir ou interromper o serviço ou servidores</li>
              <li>Transmitir vírus, malware ou código malicioso</li>
              <li>Fazer engenharia reversa da plataforma</li>
              <li>Revender ou redistribuir o serviço sem autorização</li>
              <li>Usar bots ou scripts automatizados sem permissão</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Propriedade Intelectual</h2>
            <h3 className="text-xl font-semibold mb-2 mt-4">6.1 Conteúdo do Usuário</h3>
            <p>
              Você retém todos os direitos sobre o conteúdo que criar na plataforma. Ao usar nosso serviço, você nos
              concede uma licença limitada para armazenar, processar e exibir seu conteúdo conforme necessário para
              fornecer o serviço.
            </p>
            <h3 className="text-xl font-semibold mb-2 mt-4">6.2 Plataforma</h3>
            <p>
              A plataforma, incluindo código-fonte, design, funcionalidades e marca, são propriedade de {getDisplayName()}
              e estão protegidos por leis de propriedade intelectual.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Privacidade e Dados</h2>
            <p>
              Nossa coleta e uso de dados pessoais é regida por nossa Política de Privacidade. Ao usar o serviço,
              você concorda com nossa Política de Privacidade.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Limitação de Responsabilidade</h2>
            <p>
              O serviço é fornecido "como está" sem garantias de qualquer tipo. Não nos responsabilizamos por:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Perda de dados ou interrupções de serviço</li>
              <li>Danos indiretos, incidentais ou consequenciais</li>
              <li>Precisão ou confiabilidade do conteúdo gerado por IA</li>
              <li>Ações de terceiros ou serviços integrados</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Rescisão</h2>
            <p>
              Podemos suspender ou encerrar sua conta a qualquer momento por violação destes termos. Você pode
              encerrar sua conta a qualquer momento através das configurações.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Modificações</h2>
            <p>
              Reservamos o direito de modificar estes termos a qualquer momento. Notificaremos sobre mudanças
              significativas por email ou através da plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Lei Aplicável</h2>
            <p>
              Estes termos são regidos pelas leis do Brasil. Quaisquer disputas serão resolvidas nos tribunais
              competentes do Brasil.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Contato</h2>
            <p>
              Para questões sobre estes Termos de Serviço, entre em contato conosco através do suporte da plataforma.
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
