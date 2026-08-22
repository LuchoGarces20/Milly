Objetivo do projeto
O Milly é um SaaS B2C focado na gestão unificada e inteligente de milhas e pontos de fidelidade para usuários individuais, casais ou famílias. O sistema centraliza programas, calcula o Custo por Milheiro (CPM) base, projeta lucros/prejuízos, automatiza mensalidades de clubes com motor FIFO, prevê vencimentos de pontos, controla quarentenas para re-assinatura bonificada, exibe os níveis (tiers) dos clubes, mapeia oportunidades de consolidação via Conta Família e gerencia saldos iniciais via snapshots automáticos (Marco Zero).  
ZIP
+ 4
Stack tecnológica
Linguagem: JavaScript Moderno (ES6+).  
ZIP
Framework Frontend: React.js.  
ZIP
Build Tool & Dev Server: Vite.  
ZIP
Estilização: Tailwind CSS v4 com suporte nativo a Dark Mode (Estilo Midnight/OLED #0B0F19).  
ZIP
Ícones: lucide-react.  
ZIP
Backend & Banco de Dados (MVP Atual): Operação 100% Client-side em memória via estado React (useState) e Custom Hooks.  
ZIP
Backend & Banco de Dados (Fase 2 - Planejado): Supabase (PostgreSQL), Autenticação e Row Level Security (RLS).  
ZIP
Arquitetura
A aplicação adota uma arquitetura desacoplada baseada em componentes visuais e hooks de domínio. Toda a inteligência financeira e regras de negócio residem no custom hook useMilesData e utilitários puros. Os componentes de interface atuam majoritariamente como componentes de apresentação (Presentational Components).  
ZIP
+ 2
Responsabilidades por diretório:
src/constants/: Catalogação de programas base, níveis de clube (tiers), prazos de quarentena, flag de Conta Família e formulários iniciais.  
ZIP
+ 1
src/utils/: Algoritmos puros de cálculo financeiro, gerador de transações recorrentes de clubes (clubEngine.js), conversões e formatadores.  
ZIP
src/hooks/: Estado global da aplicação, orquestração matemática de CPM, extrato, motor FIFO e conciliação de snapshots.  
ZIP
src/components/layout/: Elementos estruturais globais (Header e navegação principal).  
ZIP
src/components/modals/: Modais para gestão de programas/clubes, transações e perfis de titulares.  
ZIP
src/components/views/: Visões/telas completas da aplicação (Onboarding, Dashboard, Detalhes do Programa e Simulador de Transferência).  
ZIP
Fluxos principais
1. Fluxo de Onboarding & Setup Inicial com Snapshot
Usuário Acessa a Aplicação
↓
Escolha de perfil (Individual, Casal ou Família)
↓
Definição dos nomes dos Titulares
↓
Seleção de programas e inserção do Saldo Total Atual (Marco Zero) em grade interativa
↓
Salvamento no Hook Central com flag de isSnapshot: true
↓
Redirecionamento para o Dashboard  
ZIP
+ 3
2. Gestão de Programas, Clubes, Quarentena e Tiers
Dashboard ou ProgramView → Clique em "Novo Programa" ou "Editar"
↓
Abertura do ProgramModal
↓
Configuração do Clube (Status ativo, Nível/Tier, Frequência, Pontos Base/Bônus ou Data do Último Cancelamento para Quarentena)
↓
Validação de Duplicidade por Titular
↓
Atualização no useMilesData → Atualização do motor de clubes e recálculo dos indicadores  
ZIP
+ 4
3. Lançamento e Processamento de Transações
Dashboard ou ProgramView → Clique em "Lançar Transação"
↓
TransactionModal (Entrada ou Saída com data de validade/vitalício)
↓
Recálculo em Tempo Real de Saldo, CPM Médio, Lucro Potencial e Vencimentos (Algoritmo FIFO e tratamento de snapshots)  
ZIP
+ 2
4. Otimização de Conta Família (Consolidador)
Dashboard (Visão Geral / Todos)
↓
Algoritmo mapeia programas ativos compartilhados entre múltiplos titulares com suporte a Pool Gratuito
↓
Exibição do Card Destaque "Otimização de Família Disponível" com a soma dos saldos unificados sem custo de transferência  
ZIP
+ 3
5. Simulação de Transferência Bonificada
Header → Seleção da Tela "Simulador"
↓
SimulatorView (Seleção de Carteira Origem, Destino, Pontos Enviados e % Bônus)
↓
Cálculo Instantâneo: Novo CPM Diluído no Destino, Custo Total e Lucro Potencial a Mercado  
ZIP
+ 2
6. Navegação Drill-Down no Ativo & Radar de Quarentena
Tabela do Dashboard → Clique em um Programa
↓
Abertura da ProgramView (Badges do Nível do Clube, Extrato com marcação de Marco Zero, Validade e Cronômetro de Quarentena de Re-assinatura Bonificada)  
ZIP
+ 2
Regras de negócio
Isolamento de Titularidade: O patrimônio é consolidado na aba "Visão Geral/Todos", permitindo também navegação individualizada por titular.  
ZIP
Segregação Financeira: Pontos de Banco, Milhas Aéreas e Hospedagem dividem o mesmo painel, mas mantêm histórico independente.  
ZIP
Cálculo de CPM Base: Multiplicador do investimento total diluído pelo saldo em milheiros (Investimento Total / (Saldo / 1000)).  
ZIP
Resultado Potencial a Mercado: Diferença entre o Valor de Liquidação no Balcão ((Saldo / 1000) * MarketCPM) e o Investimento Histórico.  
ZIP
Motor Automático de Clubes (clubEngine.js): Assinaturas geram transações mensais não editáveis a partir da data de início. Se o clube for cancelado (clubEndDate), o lançamento de novas parcelas é interrompido.  
ZIP
+ 1
Controle de Quarentena de Clubes: Se um clube estiver inativo e houver uma lastCancellationDate, o sistema calcula o tempo restante de carência imposto pelo programa (ex: 12 meses) para que o usuário volte a ser elegível a bônus de adesão.  
MD
Níveis de Clube (Tiers): O programa aceita a especificação do plano assinado (ex: Clube 1.000, 5.000, 10.000, 20.000) para contexto estratégico.  
MD
Algoritmo FIFO e Vencimentos: Lançamentos de saída deduzem prioritariamente o saldo dos lotes de entrada mais antigos.  
ZIP
Snapshot de Saldo Inicial (Marco Zero): O saldo informado pelo usuário no onboarding é processado como uma verdade absoluta (isSnapshot: true). O sistema calcula automaticamente a diferença de compensação frente a eventuais pontos gerados por clubes criados retroativamente, eliminando fricção e cálculos manuais.
Otimizador de Conta Família: Programas catalogados com suporte a pool gratuito agrupam automaticamente o saldo de múltiplos titulares do casal/família no Dashboard.  
MD
Radar Preditivo de 12 Meses: Monitora e lista lotes de pontos com expiração nos próximos 365 dias.  
ZIP
Padrões utilizados
Custom Hooks: Toda a matemática financeira, cálculo FIFO, agrupamento de titulares e estado do Dark Mode residem isolados em useMilesData.js.  
ZIP
Presentational / Dumb Components: Componentes e modais funcionam como interfaces puras renderizadas por passagem de props.  
ZIP
Pure Utility Engine: Regras puras desacopladas de estados React (ex: clubEngine.js e helpers.jsx).  
ZIP
State-Driven Navigation: Controle de telas ativas e exibição de modais gerenciados via estados em App.jsx.  
ZIP
Utility-First Design System: Interface estilizada exclusivamente via Tailwind CSS com esquema OLED/Midnight #0B0F19.  
ZIP
Convenções do projeto
Design System & Cores Semânticas: Esmeralda (lucro/ativo), Vermelho (prejuízo/saída), Violeta (ações primárias/tiers), Âmbar (alertas de vencimento e quarentena) e Azul (balcão/titular e transações de snapshot/marco zero).  
ZIP
+ 1
Tipografia Financeira: Valores em moeda, saldos e cálculos numéricos usam obrigatoriamente fonte monoespaçada (font-mono).  
ZIP
Nomenclatura: Variáveis e funções em camelCase; Componentes e arquivos JSX em PascalCase.  
ZIP
Tratamento de Dados: Renderização condicional para Empty States quando tabelas/gráficos estiverem vazios.  
ZIP
Imutabilidade: Atualizações em arrays ou objetos do estado utilizam obrigatoriamente spread operators.  
ZIP
Dependências importantes
vite & @vitejs/plugin-react: Dev server e empacotador de alta performance.  
ZIP
tailwindcss & @tailwindcss/vite (v4): Estilização utilitária com dark mode nativo.  
ZIP
lucide-react: Iconografia vetorizada minimalista utilizada na UI.  
ZIP
Estrutura resumida
Plaintext
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
* **`src/hooks/useMilesData.js`:** Cérebro financeiro do sistema que mantém o estado unificado, calcula CPM, FIFO, reconciliação de snapshots e consolida indicadores[cite: 1].
* **`src/constants/milesConfig.js`:** Catálogos base de programas, categorias, cotações padrão, tiers, carências de quarentena e modelos de formulários[cite: 1, 2].
* **`src/utils/clubEngine.js`:** Motor puramente matemático que calcula e injeta transações automáticas recorrentes dos clubes[cite: 1].
* **`src/components/views/DashboardView.jsx`:** Visão geral com métricas globais, alerta de Conta Família e lista de programas por titular[cite: 1, 2].
* **`src/components/views/ProgramView.jsx`:** Detalhe do programa com histórico de transações (incluindo marcação de Marco Zero/Snapshot), alerta de quarentena e badge de nível de clube[cite: 1, 2].
* **`src/components/views/SimulatorView.jsx`:** Tela dedicada à simulação de transferências bonificadas, dilution de CPM e projeção de lucros[cite: 1].

# Decisões arquiteturais
* **Arquitetura Client-Side Facade MVP:** Todas as transações ocorrem em memória para maximizar a velocidade de iteração visual e validar as fórmulas de milhas[cite: 1]. Na Fase 2, a assinatura pública do custom hook `useMilesData` será mantida, alterando apenas os manipuladores internos para chamadas assíncronas no Supabase (PostgreSQL) sem quebrar o layout[cite: 1].

# Pontos de atenção
* **Recálculo Client-Side Volátil:** O algoritmo FIFO e as deduções de extrato são reprocessados a cada alteração de estado em memória[cite: 1].
* **Sincronismo de Clubes:** As transações automáticas são geradas dinamicamente com base nas datas do clube e não aceitam edições diretas pelo extrato[cite: 1].
* **Persistência Temporária:** Na versão MVP atual, um recarregamento manual da página (`F5`) reinicia o estado em memória[cite: 1].

# Como adicionar uma nova funcionalidade
1. **Modelagem de Dados e Constantes:** Caso a funcionalidade crie novos atributos ou flags (como os metadados de snapshot), adicione as estruturas base em `src/constants/milesConfig.js`[cite: 1].
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
* **Snapshot (Marco Zero):** Registro inicial de saldo inserido no onboarding (`isSnapshot: true`) que atua como verdade absoluta do patrimônio do usuário, neutralizando pontos gerados automaticamente de forma retroativa pelos clubes e evitando fricção matemática.