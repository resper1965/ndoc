#!/usr/bin/env node

/**
 * Script para configurar variáveis de ambiente na Vercel via API
 * Projeto: ndoc (ndoc-xi1n)
 */

const https = require('https');

// Configurações
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = 'prj_IIZqdTLvxYy4oHflCl6IKYBQqcn6';
const TEAM_ID = 'team_iz6jrPdYbt5I3BtGFHb6hY16';

// Variáveis do Supabase (obtidas via MCP)
const ENV_VARS = [
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    value: 'https://ajyvonzyoyxmiczflfiz.supabase.co',
    target: ['production', 'preview', 'development'],
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqeXZvbnp5b3l4bWljemZsZml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjYwNTEsImV4cCI6MjA3ODcwMjA1MX0.Q1IdRXq2KVhe4-Gk_TDohtaN_mJU7hULHz80EkqBgx4',
    target: ['production', 'preview', 'development'],
  },
];

if (!VERCEL_TOKEN) {
  console.error('❌ VERCEL_TOKEN não encontrado!');
  console.error('   Configure com: export VERCEL_TOKEN=seu_token');
  console.error('   Obtenha o token em: https://vercel.com/account/tokens');
  process.exit(1);
}

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function setEnvVar(key, value, targets) {
  const options = {
    hostname: 'api.vercel.com',
    path: `/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  const data = {
    key,
    value,
    type: 'encrypted',
    target: targets,
  };

  try {
    await makeRequest(options, data);
    console.log(`✅ ${key} configurada com sucesso`);
    return true;
  } catch (error) {
    if (error.message.includes('409') || error.message.includes('already exists')) {
      console.log(`⚠️  ${key} já existe. Atualizando...`);
      // Tentar atualizar
      return updateEnvVar(key, value, targets);
    }
    console.error(`❌ Erro ao configurar ${key}:`, error.message);
    return false;
  }
}

async function updateEnvVar(key, value, targets) {
  // Primeiro, listar variáveis existentes para obter o ID
  const listOptions = {
    hostname: 'api.vercel.com',
    path: `/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
    },
  };

  try {
    const envVars = await makeRequest(listOptions);
    const existing = envVars.envs?.find((e) => e.key === key);
    
    if (existing) {
      const updateOptions = {
        hostname: 'api.vercel.com',
        path: `/v10/projects/${PROJECT_ID}/env/${existing.id}?teamId=${TEAM_ID}`,
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json',
        },
      };

      const updateData = {
        value,
        target: targets,
      };

      await makeRequest(updateOptions, updateData);
      console.log(`✅ ${key} atualizada com sucesso`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Erro ao atualizar ${key}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Configurando variáveis de ambiente na Vercel...\n');
  console.log(`📋 Projeto: ${PROJECT_ID}`);
  console.log(`👥 Team: ${TEAM_ID}\n`);

  let success = 0;
  for (const envVar of ENV_VARS) {
    const result = await setEnvVar(envVar.key, envVar.value, envVar.target);
    if (result) success++;
  }

  console.log(`\n✅ ${success}/${ENV_VARS.length} variáveis configuradas com sucesso!`);
  console.log('\n🚀 Próximos passos:');
  console.log('   1. Faça um novo deploy: vercel --prod');
  console.log('   2. Ou aguarde o deploy automático no próximo push');
}

main().catch(console.error);

