# Objetivo do projeto
O Milly é um SaaS B2C focado na gestão unificada e inteligente de milhas e pontos de fidelidade para usuários individuais, casais ou famílias[cite: 1]. O sistema centraliza programas[cite: 1], calcula o Custo por Milheiro (CPM) base[cite: 1], projeta lucros/prejuízos[cite: 1], automatiza mensalidades de clubes com motor FIFO[cite: 1], prevê vencimentos de pontos[cite: 1], controla quarentenas para re-assinatura bonificada, exibe os níveis (tiers) dos clubes e mapeia oportunidades de consolidação via Conta Família.

# Stack tecnológica
* **Linguagem:** JavaScript Moderno (ES6+)[cite: 1].
* **Framework Frontend:** React.js[cite: 1].
* **Build Tool & Dev Server:** Vite[cite: 1].
* **Estilização:** Tailwind CSS v4 com suporte nativo a Dark Mode (Estilo Midnight/OLED `#0B0F19`)[cite: 1].
* **Ícones:** `lucide-react`[cite: 1].
* **Backend & Banco de Dados (MVP Atual):** Operação 100% Client-side em memória via estado React (`useState`) e Custom Hooks[cite: 1].
* **Backend & Banco de Dados (Fase 2 - Planejado):** Supabase (PostgreSQL), Autenticação e Row Level Security (RLS)[cite: 1].

# Arquitetura
A aplicação adota uma arquitetura desacoplada baseada em componentes visuais e hooks de domínio[cite: 1]. Toda a inteligência financeira e regras de negócio residem no custom hook `useMilesData` e utilitários puros[cite: 1]. Os componentes de interface atuam majoritariamente como componentes de apresentação (*Presentational Components*)[cite: 1].

Responsabilidades por diretório:
* `src/constants/`: Catalogação de programas base, níveis de clube (tiers), prazos de quarentena, flag de Conta Família e formulários iniciais[cite: 1, 2].
* `src/utils/`: Algoritmos puros de cálculo financeiro, gerador de transações recorrentes de clubes (`clubEngine.js`), conversões e formatadores[cite: 1].
* `src/hooks/`: Estado global da aplicação, orquestração matemática de CPM, extrato e deduções FIFO[cite: 1].
* `src/components/layout/`: Elementos estruturais globais (Header e navegação principal)[cite: 1].
* `src/components/modals/`: Modais para gestão de programas/clubes, transações e perfis de titulares[cite: 1].
* `src/components/views/`: Visões/telas completas da aplicação (Onboarding, Dashboard, Detalhes do Programa e Simulador de Transferência)[cite: 1].

# Fluxos principais

### 1. Fluxo de Onboarding & Setup Inicial
Usuário Acessa a Aplicação
↓
Escolha de perfil (Individual, Casal ou Família)[cite: 1]
↓
Definição dos nomes dos Titulares[cite: 1]
↓
Seleção de programas e saldos em grade interativa[cite: 1]
↓
Salvamento no Hook Central (`useMilesData`)[cite: 1]
↓
Redirecionamento para o Dashboard[cite: 1]

### 2. Gestão de Programas, Clubes, Quarentena e Tiers
Dashboard ou ProgramView → Clique em "Novo Programa" ou "Editar"[cite: 1]
↓
Abertura do `ProgramModal`[cite: 1]
↓
Configuração do Clube (Status ativo, Nível/Tier, Frequência, Pontos Base/Bônus ou Data do Último Cancelamento para Quarentena)[cite: 1, 2]
↓
Validação de Duplicidade por Titular[cite: 1]
↓
Atualização no `useMilesData` → Atualização do motor de clubes e recálculo dos indicadores[cite: 1]

### 3. Lançamento e Processamento de Transações
Dashboard ou ProgramView → Clique em "Lançar Transação"[cite: 1]
↓
`TransactionModal` (Entrada ou Saída com data de validade/vitalício)[cite: 1]
↓
Recálculo em Tempo Real de Saldo, CPM Médio, Lucro Potencial e Vencimentos (Algoritmo FIFO)[cite: 1]

### 4. Otimização de Conta Família (Consolidador)
Dashboard (Visão Geral / Todos)[cite: 1, 2]
↓
Algoritmo mapeia programas ativos compartilhados entre múltiplos titulares com suporte a Pool Gratuito[cite: 2]
↓
Exibição do Card Destaque "Otimização de Família Disponível" com a soma dos saldos unificados sem custo de transferência[cite: 2]

### 5. Simulação de Transferência Bonificada
Header → Seleção da Tela "Simulador"[cite: 1]
↓
`SimulatorView` (Seleção de Carteira Origem, Destino, Pontos Enviados e % Bônus)[cite: 1]
↓
Cálculo Instantâneo: Novo CPM Diluído no Destino, Custo Total e Lucro Potencial a Mercado[cite: 1]

### 6. Navegação Drill-Down no Ativo & Radar de Quarentena
Tabela do Dashboard → Clique em um Programa[cite: 1]
↓
Abertura da `ProgramView` (Badges do Nível do Clube, Extrato, Validade e Cronômetro de Quarentena de Re-assinatura Bonificada)[cite: 1, 2]

# Regras de negócio
* **Isolamento de Titularidade:** O patrimônio é consolidado na aba "Visão Geral/Todos", permitindo também navegação individualizada por titular[cite: 1].
* **Segregação Financeira:** Pontos de Banco, Milhas Aéreas e Hospedagem dividem o mesmo painel, mas mantêm histórico independente[cite: 1].
* **Cálculo de CPM Base:** Multiplicador do investimento total diluído pelo saldo em milheiros (`Investimento Total / (Saldo / 1000)`)[cite: 1].
* **Resultado Potencial a Mercado:** Diferença entre o Valor de Liquidação no Balcão (`(Saldo / 1000) * MarketCPM`) e o Investimento Histórico[cite: 1].
* **Motor Automático de Clubes (`clubEngine.js`):** Assinaturas geram transações mensais não editáveis a partir da data de início[cite: 1]. Se o clube for cancelado (`clubEndDate`), o lançamento de novas parcelas é interrompido[cite: 1].
* **Controle de Quarentena de Clubes:** Se um clube estiver inativo e houver uma `lastCancellationDate`, o sistema calcula o tempo restante de carência imposto pelo programa (ex: 12 meses) para que o usuário volte a ser elegível a bônus de adesão[cite: 2].
* **Níveis de Clube (Tiers):** O programa aceita a especificação do plano assinado (ex: Clube 1.000, 5.000, 10.000, 20.000) para contexto estratégico[cite: 2].
* **Algoritmo FIFO e Vencimentos:** Lançamentos de saída deduzem prioritariamente o saldo dos lotes de entrada mais antigos[cite: 1].
* **Otimizador de Conta Família:** Programas catalogados com suporte a pool gratuito agrupam automaticamente o saldo de múltiplos titulares do casal/família no Dashboard[cite: 2].
* **Radar Preditivo de 12 Meses:** Monitora e lista lotes de pontos com expiração nos próximos 365 dias[cite: 1].

# Padrões utilizados
* **Custom Hooks:** Toda a matemática financeira, cálculo FIFO, agrupamento de titulares e estado do Dark Mode residem isolados em `useMilesData.js`[cite: 1].
* **Presentational / Dumb Components:** Componentes e modais funcionam como interfaces puras renderizadas por passagem de `props`[cite: 1].
* **Pure Utility Engine:** Regras puras desacopladas de estados React (ex: `clubEngine.js` e `helpers.jsx`)[cite: 1].
* **State-Driven Navigation:** Controle de telas ativas e exibição de modais gerenciados via estados em `App.jsx`[cite: 1].
* **Utility-First Design System:** Interface estilizada exclusivamente via Tailwind CSS com esquema OLED/Midnight `#0B0F19`[cite: 1].

# Convenções do projeto
* **Design System & Cores Semânticas:** Esmeralda (lucro/ativo), Vermelho (prejuízo/saída), Violeta (ações primárias/tiers), Âmbar (alertas de vencimento e quarentena) e Azul (balcão/titular)[cite: 1, 2].
* **Tipografia Financeira:** Valores em moeda, saldos e cálculos numéricos usam obrigatoriamente fonte monoespaçada (`font-mono`)[cite: 1].
* **Nomenclatura:** Variáveis e funções em `camelCase`; Componentes e arquivos JSX em `PascalCase`[cite: 1].
* **Tratamento de Dados:** Renderização condicional para *Empty States* quando tabelas/gráficos estiverem vazios[cite: 1].
* **Imutabilidade:** Atualizações em arrays ou objetos do estado utilizam obrigatoriamente *spread operators*[cite: 1].

# Dependências importantes
* **`vite` & `@vitejs/plugin-react`:** Dev server e empacotador de alta performance[cite: 1].
* **`tailwindcss` & `@tailwindcss/vite` (v4):** Estilização utilitária com dark mode nativo[cite: 1].
* **`lucide-react`:** Iconografia vetorizada minimalista utilizada na UI[cite: 1].

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
│   │   ├── formatters.js
│   │   └── helpers.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── PROJECT.md
```[cite: 1]

# Arquivos essenciais
* **`src/App.jsx`:** Orquestrador principal da aplicação que gerencia a navegação global e acionamento dos modais[cite: 1].
* **`src/hooks/useMilesData.js`:** Cérebro financeiro do sistema que mantém o estado unificado, calcula CPM, FIFO e consolida indicadores[cite: 1].
* **`src/constants/milesConfig.js`:** Catálogos base de programas, categorias, cotações padrão, tiers, carências de quarentena e modelos de formulários[cite: 1, 2].
* **`src/utils/clubEngine.js`:** Motor puramente matemático que calcula e injeta transações automáticas recorrentes dos clubes[cite: 1].
* **`src/components/views/DashboardView.jsx`:** Visão geral com métricas globais, alerta de Conta Família e lista de programas por titular[cite: 1, 2].
* **`src/components/views/ProgramView.jsx`:** Detalhe do programa com histórico de transações, alerta de quarentena e badge de nível de clube[cite: 1, 2].
* **`src/components/views/SimulatorView.jsx`:** Tela dedicada à simulação de transferências bonificadas, dilution de CPM e projeção de lucros[cite: 1].

# Decisões arquiteturais
* **Arquitetura Client-Side Facade MVP:** Todas as transações ocorrem em memória para maximizar a velocidade de iteração visual e validar as fórmulas de milhas[cite: 1]. Na Fase 2, a assinatura pública do custom hook `useMilesData` será mantida, alterando apenas os manipuladores internos para chamadas assíncronas no Supabase (PostgreSQL) sem quebrar o layout[cite: 1].

# Pontos de atenção
* **Recálculo Client-Side Volátil:** O algoritmo FIFO e as deduções de extrato são reprocessados a cada alteração de estado em memória[cite: 1].
* **Sincronismo de Clubes:** As transações automáticas são geradas dinamicamente com base nas datas do clube e não aceitam edições diretas pelo extrato[cite: 1].
* **Persistência Temporária:** Na versão MVP atual, um recarregamento manual da página (`F5`) reinicia o estado em memória[cite: 1].

# Como adicionar uma nova funcionalidade
1. **Modelagem de Dados e Constantes:** Caso a funcionalidade crie novos atributos, adicione as estruturas base em `src/constants/milesConfig.js`[cite: 1].
2. **Lógica de Negócio / Motor Financeiro:** Adicione ou modifique o cálculo correspondente nos blocos `useMemo` de `src/hooks/useMilesData.js` ou em scripts em `src/utils/`[cite: 1].
3. **Coleta de Dados:** Atualize ou crie um componente dentro de `src/components/modals/` com as entradas de dados do usuário[cite: 1].
4. **Exibição Visual:** Renderize as novas informações criando ou adaptando um arquivo dentro de `src/components/views/`[cite: 1].
5. **Orquestração de Rota:** Adicione a chave de navegação no `App.jsx` e inclua o acionador no `Header.jsx`[cite: 1].

# Glossário
* **CPM (Custo por Milheiro):** Custo médio pago a cada 1.000 pontos acumulados[cite: 1].
* **Cotação de Balcão:** Preço médio pago pelo mercado na compra de milhas de um determinado programa[cite: 1].
* **Motor FIFO (First-In, First-Out):** Lógica que consome primeiro o saldo dos lotes de milhas mais antigos para evitar expiração imprevista[cite: 1].
* **Diluição de CPM:** Efeito matemático causado por bônus de transferência ou pontos adicionais do clube que reduzem o custo médio final[cite: 1].
* **Quarentena de Clube:** Período de carência obrigatório que um usuário deve aguardar após cancelar um clube para ser elegível a novos bônus de adesão[cite: 2].
* **Tier (Nível do Clube):** A categoria específica do plano de assinatura (ex: Clube 1.000 vs. Clube 20.000)[cite: 2].
* **Conta Família (Pool):** Funcionalidade oferecida por determinados programas que permite agrupar os pontos de múltiplos CPFs sem cobrança de taxa de transferência[cite: 2].