# Objetivo do projeto
O Milly é um SaaS B2C focado na gestão unificada e inteligente de milhas e pontos de fidelidade para usuários individuais, casais ou famílias[cite: 1, 4]. O sistema centraliza programas, calcula o Custo por Milheiro (CPM) base, projeta lucros/prejuízos, automatiza mensalidades de clubes com motor FIFO, prevê vencimentos de pontos, controla quarentenas para re-assinatura bonificada, exibe os níveis (tiers) dos clubes, mapeia oportunidades de consolidação via Conta Família, gerencia saldos iniciais via snapshots automáticos (Marco Zero) e oferece simulações financeiras com customização de balcão[cite: 1, 4].

# Stack tecnológica
* **Linguagem:** JavaScript Moderno (ES6+).  
* **Framework Frontend:** React.js.  
* **Build Tool & Dev Server:** Vite.  
* **Estilização:** Tailwind CSS v4 com suporte nativo a Dark Mode (Estilo Midnight/OLED `#0B0F19`)[cite: 1, 3, 4].  
* **Íconografia:** `lucide-react` (com identidade visual baseada no ícone Orbit vetorizado).  
* **Backend & Banco de Dados (MVP Atual):** Operação 100% Client-side em memória via estado React (`useState`) e Custom Hooks.  
* **Backend & Banco de Dados (Fase 2 - Planejado):** Supabase (PostgreSQL), Autenticação e Row Level Security (RLS).  

# Arquitetura
A aplicação adota uma arquitetura desacoplada baseada em componentes visuais e hooks de domínio. Toda a inteligência financeira e regras de negócio residem no custom hook `useMilesData` e utilitários puros. Os componentes de interface atuam majoritariamente como componentes de apresentação (*Presentational Components*).  

Responsabilidades por diretório:
* `src/constants/`: Catalogação de programas base, níveis de clube (tiers), prazos de quarentena, flag de Conta Família e formulários iniciais.  
* `src/utils/`: Algoritmos puros de cálculo financeiro, gerador de transações recorrentes de clubes (`clubEngine.js`), formatadores e ícones auxiliares unificados (`helpers.jsx`).  
* `src/hooks/`: Estado global da aplicação, orquestração matemática de CPM, extrato, motor FIFO, conciliação de snapshots e gerenciamento do sistema de Toasts.  
* `src/components/layout/`: Elementos estruturais globais (Header com branding unificado e navegação principal).  
* `src/components/modals/`: Modais para gestão de programas/clubes estruturados com Progressive Disclosure, transações e perfis de titulares com IDs únicos (UUIDs).  
* `src/components/views/`: Visões/telas completas da aplicação (Onboarding, Dashboard responsivo com Cards no mobile, Detalhes do Programa e Simulador de Transferência com cotação de balcão editável).  

# Fluxos principais
1. **Fluxo de Onboarding & Setup Inicial com Snapshot:**
   Usuário Acessa a Aplicação → Escolha de perfil (Individual, Casal ou Família) → Definição dos nomes dos Titulares → Seleção de programas e inserção do Saldo Total Atual (Marco Zero) em grade interativa → Salvamento no Hook Central com flag `isSnapshot: true` → Redirecionamento para o Dashboard[cite: 1, 4].  

2. **Gestão de Programas, Clubes (Progressive Disclosure), Quarentena e Tiers:**
   Dashboard ou ProgramView → Clique em "Novo Programa" ou "Editar" → Abertura do `ProgramModal` compartimentado em abas (Geral, Clube, Regras Avançadas) → Configuração do Clube → Validação de Duplicidade por Titular → Feedback via Toast flutuante → Atualização no `useMilesData`[cite: 1, 4].  

3. **Lançamento e Processamento de Transações:**
   Dashboard ou ProgramView → Clique em "Lançar Transação" → `TransactionModal` (Entrada ou Saída com data de validade/vitalício) → Recálculo em Tempo Real de Saldo, CPM Médio, Lucro Potencial e Vencimentos (Algoritmo FIFO e tratamento de snapshots).  

4. **Otimização de Conta Família (Consolidador):**
   Dashboard (Visão Geral / Todos) → Algoritmo mapeia programas ativos compartilhados entre múltiplos titulares com suporte a Pool Gratuito → Exibição do Card Destaque "Otimização de Família Disponível" com a soma dos saldos unificados sem custo de transferência[cite: 1, 2, 4].  

5. **Simulação de Transferência Bonificada com Cotação Customizada:**
   Header → Seleção da Tela "Simulador" → `SimulatorView` (Seleção de Carteira Origem, Destino, Pontos Enviados, % Bônus e ajuste livre da Cotação de Destino) → Cálculo Instantâneo: Novo CPM Diluído no Destino, Custo Total e Lucro Potencial a Mercado.  

6. **Navegação Drill-Down no Ativo & Radar de Quarentena:**
   Tabela/Cards do Dashboard → Clique em um Programa → Abertura da `ProgramView` (Badges do Nível do Clube, Extrato com marcação de Marco Zero, Validade e Cronômetro de Quarentena de Re-assinatura Bonificada).  

# Regras de negócio
* **Isolamento de Titularidade:** O patrimônio é consolidado na aba "Visão Geral/Todos", permitindo também navegação individualizada por titular com suporte a IDs únicos (UUIDs) para evitar colisões de homônimos[cite: 1, 4].  
* **Segregação Financeira:** Pontos de Banco, Milhas Aéreas e Hospedagem dividem o mesmo painel, mas mantêm histórico independente[cite: 1, 4].  
* **Cálculo de CPM Base:** Multiplicador do investimento total diluído pelo saldo em milheiros (`Investimento Total / (Saldo / 1000)`)[cite: 1, 4].  
* **Resultado Potencial a Mercado:** Diferença entre o Valor de Liquidação no Balcão (`(Saldo / 1000) * MarketCPM`) e o Investimento Histórico[cite: 1, 4].  
* **Motor Automático de Clubes (`clubEngine.js`):** Assinaturas geram transações mensais não editáveis a partir da data de início. Se o clube for cancelado (`clubEndDate`), o lançamento de novas parcelas é interrompido[cite: 1, 4].  
* **Controle de Quarentena de Clubes:** Se um clube estiver inativo e houver uma `lastCancellationDate`, o sistema calcula o tempo restante de carência imposto pelo programa (ex: 12 meses) para que o usuário volte a ser elegível a bônus de adesão[cite: 2, 4].  
* **Níveis de Clube (Tiers):** O programa aceita a especificação do plano assinado para contexto estratégico[cite: 2, 4].  
* **Algoritmo FIFO e Vencimentos:** Lançamentos de saída deduzem prioritariamente o saldo dos lotes de entrada mais antigos[cite: 1, 4].  
* **Snapshot de Saldo Inicial (Marco Zero):** O saldo informado pelo usuário no onboarding é processado como verdade absoluta (`isSnapshot: true`)[cite: 1, 4].  
* **Otimizador de Conta Família (Pool):** Programas catalogados com suporte a pool gratuito agrupam automaticamente o saldo de múltiplos titulares do casal/família no Dashboard[cite: 2, 4].  
* **Radar Preditivo de 12 Meses:** Monitora e lista lotes de pontos com expiração nos próximos 365 dias[cite: 1, 4].  

# Padrões utilizados
* **Custom Hooks:** Toda a matemática financeira, cálculo FIFO, agrupamento de titulares, estado do Dark Mode e gerenciamento de Toasts residem isolados em `useMilesData.js`.  
* **Presentational / Dumb Components:** Componentes e modais funcionam como interfaces puras renderizadas por passagem de `props`.  
* **Pure Utility Engine:** Regras puras desacopladas de estados React (ex: `clubEngine.js` e `helpers.jsx`).  
* **State-Driven Navigation:** Controle de telas ativas e exibição de modais gerenciados via estados em `App.jsx`.  
* **Utility-First Design System:** Interface estilizada exclusivamente via Tailwind CSS com esquema OLED/Midnight `#0B0F19` e ícones vetorizados consistentes[cite: 1, 3, 4].  
* **Progressive Disclosure:** Divisão de formulários longos em etapas/abas para mitigar a sobrecarga cognitiva em dispositivos móveis.  

# Convenções do projeto
* **Design System & Cores Semânticas:** Esmeralda (lucro/ativo), Vermelho (prejuízo/saída), Violeta (ações primárias/tiers/branding), Âmbar (alertas de vencimento e quarentena) e Azul (balcão/titular e transações de snapshot/marco zero)[cite: 1, 4].  
* **Tipografia Financeira:** Valores em moeda, saldos e cálculos numéricos usam obrigatoriamente fonte monoespaçada (`font-mono`)[cite: 1, 4].  
* **Nomenclatura:** Variáveis e funções em `camelCase`; Componentes e arquivos JSX em `PascalCase`[cite: 1, 4].  
* **Feedback Visual Nativo:** Disparo automático de notificações flutuantes (*Toasts*) em operações de salvamento ou exclusão.  
* **Tratamento de Dados:** Renderização condicional para *Empty States* quando tabelas/gráficos estiverem vazios[cite: 1, 4].  
* **Imutabilidade:** Atualizações em arrays ou objetos do estado utilizam obrigatoriamente `spread operators`[cite: 1, 4].  

# Dependências importantes
* `vite` & `@vitejs/plugin-react`: Dev server e empacotador de alta performance[cite: 1, 3].  
* `tailwindcss` & `@tailwindcss/vite (v4)`: Estilização utilitária com dark mode nativo[cite: 1, 3].  
* `lucide-react`: Iconografia vetorizada minimalista utilizada na UI[cite: 1, 3].  

# Estrutura resumida
```text
milly/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── Header.jsx
│   │   ├── modals/
│   │   │   ├── ProfileModal.jsx
│   │   │   ├── ProgramModal.jsx
│   │   │   └── TransactionModal.jsx
│   │   └── views/
│   │       ├── DashboardView.jsx
│   │       ├── OnboardingView.jsx
│   │       ├── ProgramView.jsx
│   │       └── SimulatorView.jsx
│   ├── constants/
│   │   └── milesConfig.js
│   ├── hooks/
│   │   └── useMilesData.js
│   ├── utils/
│   │   ├── clubEngine.js
│   │   └── helpers.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── PROJECT.md
└── index.html
Arquivos essenciais
src/App.jsx: Orquestrador principal que gerencia rotas, modais, sistema de Toasts e layout global[cite: 1].
src/hooks/useMilesData.js: Cérebro financeiro do sistema que mantém estado unificado, calcula CPM, FIFO, reconciliação de snapshots, IDs de perfil e indicadores[cite: 1].
src/constants/milesConfig.js: Catálogos base de programas, categorias, cotações padrão, tiers, carências de quarentena e formulários iniciais.  
ZIP
+ 1
src/utils/clubEngine.js: Motor puramente matemático que calcula e injeta transações automáticas recorrentes dos clubes[cite: 1].
src/utils/helpers.jsx: Biblioteca centralizada de formatação monetária/numérica, datas e ícones de categoria[cite: 1].
src/components/views/DashboardView.jsx: Visão geral responsiva (tabela no desktop e Cards no mobile) com métricas globais, alerta de Conta Família e lista de programas[cite: 1, 2].
src/components/views/ProgramView.jsx: Detalhe do programa com histórico de transações, marcação de Marco Zero, alerta de quarentena e badge de nível de clube[cite: 1, 2].
src/components/views/SimulatorView.jsx: Tela dedicada à simulação de transferências bonificadas, diluição de CPM, projeção de lucros e estresse com cotação de balcão editável[cite: 1].
Decisões arquiteturais
Arquitetura Client-Side Facade MVP: Todas as transações ocorrem em memória para maximizar a velocidade de iteração visual e validar as fórmulas de milhas[cite: 1]. Na Fase 2, a assinatura pública do custom hook useMilesData será mantida, alterando apenas os manipuladores internos para chamadas assíncronas no Supabase sem quebrar o layout[cite: 1].
Pontos de atenção
Recálculo Client-Side Volátil: O algoritmo FIFO e as deduções de extrato são reprocessados a cada alteração de estado em memória[cite: 1].
Sincronismo de Clubes: As transações automáticas são geradas dinamicamente com base nas datas do clube e não aceitam edições diretas pelo extrato[cite: 1].
Persistência Temporária: Na versão MVP atual, um recarregamento manual da página (F5) reinicia o estado em memória (preparado para expansão com LocalStorage/Supabase)[cite: 1].
Como adicionar uma nova funcionalidade
Modelagem de Dados e Constantes: Caso a funcionalidade crie novos atributos ou flags, adicione as estruturas base em src/constants/milesConfig.js[cite: 1].
Lógica de Negócio / Motor Financeiro: Adicione ou modifique o cálculo correspondente nos blocos useMemo de src/hooks/useMilesData.js ou em scripts em src/utils/[cite: 1].
Coleta de Dados: Atualize ou crie um componente dentro de src/components/modals/ utilizando Progressive Disclosure se houver muitos campos[cite: 1].
Exibição Visual: Renderize as novas informações criando ou adaptando um arquivo dentro de src/components/views/, garantindo compatibilidade mobile (Cards) e desktop[cite: 1].
Orquestração de Rota: Adicione a chave de navegação no App.jsx, inclua o acionador no Header.jsx e utilize o sistema de showToast para feedback imediato[cite: 1].
Glossário
CPM (Custo por Milheiro): Custo médio pago a cada 1.000 pontos acumulados[cite: 1].
Cotação de Balcão: Preço médio pago pelo mercado na compra de milhas de um determinado programa[cite: 1].
Motor FIFO (First-In, First-Out): Lógica que consome primeiro o saldo dos lotes de milhas mais antigos para evitar expiração imprevista[cite: 1].
Diluição de CPM: Efeito matemático causado por bônus de transferência ou pontos adicionais do clube que reduzem o custo médio final[cite: 1].
Quarentena de Clube: Período de carência obrigatório que um usuário deve aguardar após cancelar um clube para ser elegível a novos bônus de adesão.  
HTML
Tier (Nível do Clube): A categoria específica do plano de assinatura.  
HTML
Conta Família (Pool): Funcionalidade oferecida por determinados programas que permite agrupar os pontos de múltiplos CPFs sem cobrança de taxa.  
HTML
Snapshot (Marco Zero): Registro inicial de saldo inserido no onboarding (isSnapshot: true) que atua como verdade absoluta do patrimônio do usuário[cite: 1].
Progressive Disclosure: Padrão de UX que oculta configurações avançadas ou divide formulários complexos em etapas para reduzir a sobrecarga cognitiva[cite: 1].
Toasts: Notificações flutuantes de feedback visual rápido para validação de ações do usuário[cite: 1].