# DelFinance — Testes E2E (Cypress + TypeScript)

[![E2E](https://github.com/PaulooBarros/test-qajr-delfinance/actions/workflows/e2e.yml/badge.svg)](https://github.com/PaulooBarros/test-qajr-delfinance/actions/workflows/e2e.yml)

Suíte E2E do internet banking em homologação: `https://ib-hml.delfinance.com.br`.

## 1. Estratégia

O critério de priorização foi **impacto de falha**: quanto custa ao cliente se o fluxo quebrar.

| faixa | fluxos | por quê |
|---|---|---|
| 1. O dinheiro sai errado | Pix, Pix agendado, TED, TED agendada | prejuízo direto e irreversível; é onde está o maior esforço |
| 2. Perda de acesso ou visibilidade | login e sessão, extrato, saldo na home | sem isso o cliente não opera nem confere o que aconteceu |
| 3. O cliente deixa de receber | cobrança Pix (QR Code e Copia e Cola) | pagamento que não chega ou chega no valor errado |

**Ficaram de fora:** lote, remessas, cheques e gestão de usuários (menor impacto por operação, público
de back-office). Boleto ficou de fora por impedimento: a conta de teste não tem permissão de cedente.

## 2. Cenários

Ordenados por severidade, seguindo as faixas da seção 1.

| # | faixa | cenário | spec |
|---|---|---|---|
| 1 | 1 | Pix de R$ 0,01 por chave aleatória, com PIN | `pix/pix.cy.ts` |
| 2 | 1 | Mensagem de sucesso e comprovante disponível | `pix/pix.cy.ts` |
| 3 | 1 | Pix agendado para o mês seguinte | `pix/pix.cy.ts` |
| 4 | 1 | TED de R$ 0,01 com PIN e comprovante | `ted/ted.cy.ts` |
| 5 | 1 | TED agendada, verificada na tela de Agendamentos (API + tela) | `ted/ted.cy.ts` |
| 6 | 1 | Chave Pix inexistente: aviso exibido e o fluxo não avança | `pix/pix-validacoes.cy.ts` |
| 7 | 2 | Login com credenciais válidas | `login/login.cy.ts` |
| 8 | 2 | Login inválido é recusado | `login/login.cy.ts` |
| 9 | 2 | Rota protegida bloqueada sem autenticação | `auth/sessao.cy.ts` |
| 10 | 2 | Logout invalida a sessão | `auth/sessao.cy.ts` |
| 11 | 2 | Filtro por período não exibe lançamento fora do intervalo | `extrato/extrato.cy.ts` |
| 12 | 2 | Contador de lançamentos coerente com a tabela | `extrato/extrato.cy.ts` |
| 13 | 2 | Período padrão do extrato: 1º dia do mês até hoje | `extrato/extrato.cy.ts` |
| 14 | 2 | "Limpar" restaura o período padrão | `extrato/extrato.cy.ts` |
| 15 | 2 | Extrato alcançável pelo menu, com as colunas esperadas | `extrato/extrato.cy.ts` |
| 16 | 2 | Saldo mascarado por padrão, revelado sob comando | `home/home.cy.ts` |
| 17 | 2 | Home carregada, com menu lateral | `home/home.cy.ts` |
| 18 | 3 | Cobrança por QR Code: imagem da API renderizada na tela | `pix/pix-cobranca.cy.ts` |
| 19 | 3 | Cobrança por Copia e Cola: código disponível ao usuário | `pix/pix-cobranca.cy.ts` |

- Cada cenário valida o **resultado**, não só a navegação (ex.: login exige URL `/home` **e** menu visível).
- **O extrato não depende de valor fixo:** a conta não tem massa controlada, então os testes verificam
  relações que valem com qualquer saldo (contador × tabela, datas × período filtrado).
- Os agendamentos não usam data fixa: o teste avança um mês no calendário e escolhe o primeiro dia útil.
- **Cenários 1 a 5 movimentam dinheiro** (R$ 0,01 cada) e rodam com `retries: 0`, porque um
  retry depois do PIN enviaria a transferência de novo.

## 3. Tecnologias

- Cypress 13
- TypeScript
- Node.js 22
- cypress-mochawesome-reporter (relatório HTML)
- GitHub Actions (CI)

## 4. Como instalar

```bash
git clone https://github.com/PaulooBarros/test-qajr-delfinance.git
cd test-qajr-delfinance
npm install
cp cypress.env.example.json cypress.env.json
```

Preencha o `cypress.env.json` com as credenciais de homologação enviadas por e-mail junto com a prova:

```json
{ "documento": "", "conta": "", "senha": "", "chavePix": "", "codigoSMS": "" }
```

O arquivo fica fora do Git.

## 5. Como executar

```bash
npm run cy:open               # modo UI (interativo)
npm run cy:run                # headless, suíte inteira
npm run test:ci               # headless, só o que NÃO movimenta dinheiro
npm run test:transferencias   # headless, Pix e TED — executa transferências reais de R$ 0,01
npm run typecheck             # checagem de tipos, sem executar testes
```

**Relatório:** toda execução gera `cypress/reports/index.html`, com o resultado de cada cenário e o
screenshot embutido nas falhas.

**Evidências de execução:** cada run do [GitHub Actions](https://github.com/PaulooBarros/test-qajr-delfinance/actions/workflows/e2e.yml)
publica esse relatório como artefato (`relatorio-validacoes` ou `relatorio-transferencias`), retido por 30 dias.

## 6. Defeitos encontrados

| # | defeito 
|---|---|---|
| D1 | **Campos de data (extrato e TED) apagam as barras digitadas**; no extrato, "Filtrar" volta ao período antigo sem avisar |
| D2 | **Campo de chave Pix aplica máscara de CPF** e corrompe chave aleatória (`1234abcd…` → `123.4abcd…`) | 
| D3 | **Login inválido mostra só "Unauthorized"**, em inglês e sem dizer o que está errado | 
| D4 | **TED para hoje é reagendada para amanhã sem aviso** (provável horário de corte, ~17h) | 
| D5 | **Toast de Pix agendado diz "efetuada"**, igual ao imediato | 
| D6 | Formulário de TED mostra "Campo obrigatório" em 5 campos logo após o sucesso | 
| D7 | Texto de carregamento do extrato em inglês (`Loading items...`) | 

**Nos testes:** D1 e D2 têm contorno (data pelo calendário; chave preenchida com
`invoke('val') + trigger('input')` em vez de `.type()`). D3 fica registrado num `it.skip` em
`login.cy.ts`, que espera uma mensagem em português e pode ser ativado quando o produto corrigir.

## 7. Dificuldades e decisões

- **Sem massa de dados.** Não há como resetar o estado, então cada execução deixa rastro (por isso
  R$ 0,01). O favorecido do TED é fictício, com autorização de quem administra o ambiente, e fica em
  `fixtures/`. Credencial nunca vai para o Git.
- **Pix sem `data-testid`** (login, menu e TED têm). Seletores seguem a ordem ARIA → texto visível →
  classe do Vuetify. IDs e hashes gerados pelo Vue (`#input-v-24`, `data-v-…`) foram recusados.
- **Modais empilhados:** cada etapa deixa a anterior no DOM. `cy.botaoDaEtapa()` busca o botão só no
  modal do topo.
- **PIN envia sozinho** no 6º dígito: clicar em "Confirmar" depois disso falhava de forma intermitente.
- **Calendário animado:** na troca de mês, as duas grades ficam no DOM por um instante. O teste espera
  sobrar uma antes de clicar, senão o agendamento caía em hoje.
- **Espera de estado, nunca de tempo** (nenhum `cy.wait(ms)`). O extrato espera a resposta da API,
  porque a tela mostra "sem lançamentos" enquanto a requisição ainda está no ar.
- **API × tela na cobrança e no agendamento de TED:** o que a API devolveu tem que ser o que o usuário vê.

## 8. Arquitetura

```
cypress/
├── e2e/        # specs, uma pasta por feature
├── elements/   # todos os seletores; nenhum fica escrito na spec
├── commands/   # só ações reutilizadas (login, calendário, PIN, fluxo do Pix, formulário do TED)
├── fixtures/   # favorecido fictício do TED
└── support/    # e2e.ts
```

Regra de commands: só vira `cy.algumaCoisa()` o que é usado em mais de um lugar ou esconde um detalhe
não óbvio. Datas usam o nativo `toLocaleDateString('pt-BR')`.

## 9. CI (GitHub Actions)

`.github/workflows/e2e.yml`, dividido por efeito colateral:

| gatilho | o que roda |
|---|---|
| `push` / `pull_request` | typecheck + `test:ci` (não movimenta dinheiro) |
| `workflow_dispatch` com confirmação | `test:transferencias` (movimenta dinheiro), em `environment` protegido |

Secrets: `CYPRESS_DOCUMENTO`, `CONTA`, `SENHA`, `CHAVEPIX`, `CODIGOSMS`, mapeados para `CYPRESS_documento`,
`CYPRESS_conta` etc. no `env:` do job. Execuções entram em fila (`concurrency`), porque todas usam a mesma conta.

## 10. Próximos passos

- Negativos que dependem de massa: saldo insuficiente, valor acima do limite, PIN incorreto (este,
  combinado antes, para não bloquear a conta de homologação).
- `cy.intercept()` nas confirmações de Pix e TED.
- Validar o Pix fora do fluxo, como já é feito no TED: o executado no extrato e o agendado em Agendamentos.
- Trocar `uncaught:exception → false` por um filtro de erros conhecidos.
