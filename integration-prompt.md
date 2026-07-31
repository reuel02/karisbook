---
# 🤖 Instrução de Sistema: Integração Full-Stack (KarisBook - Dashboard: CRM, Financeiro, Calendário e Anti-Furo)

## 🎯 Objetivo Principal
Você atua como um Engenheiro Full-Stack Sênior. Sua missão é analisar a interface React/TypeScript existente, remover os dados mocados (mock data) e plugar a lógica real de backend baseada nos requisitos abaixo, focando em agregar valor ao MVP do KarisBook.

## 🔍 Contexto e Reconhecimento
Antes de alterar o código, identifique os estados e funções vazias referentes a: tabelas ou listas da aba "Meus Clientes" (Mini-CRM), cards de resumo da "Gestão Financeira", botões de ação na listagem de agendamentos diários (Anti-Furo) e o componente de layout reservado para a visualização da agenda completa.

## 📐 Diretrizes de Integração (ESTRITAMENTE OBRIGATÓRIAS)

### 1. Conexão de Dados (Supabase)
- **Regra Multi-tenant Global:** Toda requisição `SELECT`, `INSERT`, `UPDATE` ou `DELETE` DEVE conter a validação `.eq('tenant_id', tenantAtual)` para garantir o isolamento dos dados da loja. Nenhuma query deve ser executada sem este filtro.
- **Mini-CRM:** Agrupe os dados da tabela `appointments`. Faça uma query que retorne o `client_name`, use o `client_whatsapp` como identificador único, e calcule o total de agendamentos (`COUNT(id)`) e a data da última visita (`MAX(date)`).
- **Gestão Financeira:** Faça um JOIN entre `appointments` e `services` (`service_id`). Calcule o faturamento somando o `price` dos serviços. Aplique estritamente o filtro `.eq('status', 'done')` na tabela `appointments`.
- **Calendário (Lazy Loading):** Busque os agendamentos na tabela `appointments` limitando o intervalo de datas (coluna `date`) estritamente ao primeiro e último dia do mês que está sendo visualizado na UI.

### 2. Regras de Negócio e Validações
- **Financeiro:** O cálculo reflete apenas o Faturamento Bruto Total, sem dedução de taxas ou comissões.
- **Otimização de Performance:** Ao mudar o mês no Calendário, dispare uma nova requisição apenas para o mês de destino (lazy loading) e armazene em cache no client-side para evitar requisições duplicadas caso o usuário volte ao mês anterior.

### 3. Integrações Externas
- **O "Anti-Furo" (WhatsApp):** No painel admin de agendamentos do dia, adicione o botão "Lembrar Cliente".
- A ação do botão não deve chamar APIs de terceiros. Deve construir uma URL dinâmica: `https://wa.me/[client_whatsapp]?text=[texto_codificado]`.
- O texto pré-formatado deve ser: "Olá, [client_name]! Passando para confirmar seu horário amanhã às [time_slot] na [Nome do Tenant]. Responda SIM para confirmar".
- O link deve ser acionado para abrir em uma nova aba (`target="_blank"`, `rel="noopener noreferrer"`).

### 4. Preservação de UI/UX
- Você está ESTRITAMENTE PROIBIDO de remover, refatorar ou alterar as classes do Tailwind CSS que definem o layout da interface original. 
- Adicione tratamento de `loading` (desabilitando botões e mostrando skeletons ou spinners durante requisições) e tratamento de erros visuais (toasts).
- **Componente de Calendário:** Escolha e instale a biblioteca de calendário mais adequada e leve para o contexto (ex: `react-day-picker` ou similar), mantendo a harmonia visual com o Tailwind.
- **Interatividade (Modais):** Ao clicar em um cliente específico no Mini-CRM ou em um dia/agendamento no Calendário, abra um Modal contendo os detalhes expandidos daquela entidade. Não redirecione para novas páginas.

## 📤 Formato de Execução Esperado
Atualize os arquivos `.tsx` ou utilitários necessários e entregue o código funcional.
---