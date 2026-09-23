# DelFinance — Testes E2E (Cypress + TypeScript)

Suíte de testes automatizados do internet banking, ambiente de homologação:
`https://ib-hml.delfinance.com.br`.

---

## 1. Estratégia

O sistema é grande: Pix, TED, transferências em lote, boletos, cheques,
remessas, cobrança, gestão de usuários. Automatizar tudo não cabia, e nem
seria a decisão certa. O critério de priorização foi **impacto de falha** —
quanto custa ao cliente se aquilo quebrar em produção.

Isso produz três faixas:

**Faixa 1 — o dinheiro sai errado.** Prejuízo direto e irreversível. É onde
está o maior esforço da suíte.

| fluxo | por que é crítico |
|---|---|
| **Pix por chave** | move dinheiro de verdade, na hora, sem estorno. É também o fluxo mais longo do sistema: 6 etapas, 3 modais empilhados, máscara de valor e autenticação por PIN — muita superfície para falhar |
| **Pix agendado** | mesma criticidade, com um risco a mais: data errada é dinheiro saindo no dia errado |
| **TED** | dinheiro para fora da instituição, com 10 campos preenchidos à mão. Errar agência, conta ou documento manda o valor para a pessoa errada |
| **TED agendado** | soma os dois riscos: destinatário e data |

**Faixa 2 — o cliente perde acesso ou visibilidade.** Não perde dinheiro, mas
fica sem operar ou sem conseguir conferir o que aconteceu.

| fluxo | por que é crítico |
|---|---|
| **Login e sessão** | porta de entrada: se quebra, nenhum outro fluxo existe. E o lado negativo importa tanto quanto o positivo — autenticar quem não deveria entrar é falha de segurança, não de usabilidade |
| **Extrato** | é como o cliente confere se o dinheiro foi para onde deveria. Um extrato que esconde lançamento destrói a confiança no banco inteiro — e foi exatamente aqui que a suíte encontrou o defeito mais grave |
| **Saldo na home** | primeira informação que o cliente procura, e a que ele mostra sem querer para quem estiver ao lado. Por isso o teste cobre o mascaramento, não só o número |

**Faixa 3 — o cliente deixa de receber.** Impacto no fluxo de entrada de
dinheiro, menos urgente que os anteriores porque não há perda consumada.

| fluxo | por que é crítico |
|---|---|
| **Cobrança Pix** | QR Code ou Copia e Cola gerado errado significa pagamento que não chega, ou que chega no valor errado |

**O que ficou de fora, e por quê:** lote, remessas, cheques e gestão de
usuários têm impacto real, mas menor por operação e com público mais restrito
(back-office, não correntista). Cobrança por boleto ficou de fora por
impedimento do ambiente, não por escolha: a conta de teste não tem permissão
de cedente, e a própria tela informa isso.

Dentro de cada fluxo, a escolha foi **caminho feliz confiável antes de
negativo instável**: suíte que falha à toa é suíte que ninguém lê. Os
negativos que faltam estão em [Próximos passos](#11-próximos-passos), cada um
com o que falta para viabilizá-lo.

A implementação separa seletor, ação e teste em camadas
([Arquitetura](#9-arquitetura)). O princípio: a spec descreve **o que** está
sendo validado, nunca **como** clicar.

---

## 2. Cenários implementados

| # | cenário | arquivo |
|---|---|---|
| 1 | Login com credenciais válidas, pela aba Documento | `cypress/e2e/login/login.cy.ts` |
| 2 | Home carregada após autenticação, com menu lateral visível | `cypress/e2e/home/home.cy.ts` |
| 3 | Transferência Pix de R$ 0,01 por chave aleatória, com confirmação por PIN | `cypress/e2e/pix/pix.cy.ts` |
| 4 | Validação da mensagem de sucesso e da disponibilidade do comprovante | `cypress/e2e/pix/pix.cy.ts` |
| 5 | Agendamento de Pix de R$ 0,01 para 30/09, com seleção no calendário | `cypress/e2e/pix/pix.cy.ts` |
| 6 | Bloqueio do avanço enquanto a chave Pix não é preenchida | `cypress/e2e/pix/pix-validacoes.cy.ts` |
| 7 | Chave inexistente não avança o fluxo | `cypress/e2e/pix/pix-validacoes.cy.ts` |
| 8 | Bloqueio do avanço com valor zerado | `cypress/e2e/pix/pix-validacoes.cy.ts` |
| 9 | Cancelamento da transferência fecha o modal e abandona o fluxo | `cypress/e2e/pix/pix-validacoes.cy.ts` |
| 10 | Valor e descrição preservados ao voltar da etapa da data | `cypress/e2e/pix/pix-validacoes.cy.ts` |
| 11 | Extrato alcançável pelo menu lateral, com as colunas esperadas | `cypress/e2e/extrato/extrato.cy.ts` |
| 12 | Período padrão do extrato: 1º dia do mês até hoje | `cypress/e2e/extrato/extrato.cy.ts` |
| 13 | Contador de lançamentos coerente com o que a tabela exibe | `cypress/e2e/extrato/extrato.cy.ts` |
| 14 | "Limpar" restaura o período padrão | `cypress/e2e/extrato/extrato.cy.ts` |
| 15 | Filtro por período não exibe lançamento fora do intervalo | `cypress/e2e/extrato/extrato.cy.ts` |
| 16 | TED alcançável pelo menu, dentro do grupo Transferências | `cypress/e2e/ted/ted-validacoes.cy.ts` |
| 17 | Formulário de TED exibe todos os campos do contrato | `cypress/e2e/ted/ted-validacoes.cy.ts` |
| 18 | Envio bloqueado com o formulário de TED vazio | `cypress/e2e/ted/ted-validacoes.cy.ts` |
| 19 | Agência e conta aceitam apenas dígitos | `cypress/e2e/ted/ted-validacoes.cy.ts` |
| 20 | CPF e valor formatados durante a digitação | `cypress/e2e/ted/ted-validacoes.cy.ts` |
| 21 | Busca de banco pelo código no autocomplete | `cypress/e2e/ted/ted-validacoes.cy.ts` |
| 22 | TED de R$ 0,01 para favorecido de teste, com PIN e comprovante | `cypress/e2e/ted/ted.cy.ts` |
| 23 | TED agendada para 30/09, verificada na tela de Agendamentos | `cypress/e2e/ted/ted.cy.ts` |
| 24 | Cobrança Pix por QR Code, com a imagem da API renderizada na tela | `cypress/e2e/pix/pix-cobranca.cy.ts` |
| 25 | Cobrança Pix por Copia e Cola, com o código disponível ao usuário | `cypress/e2e/pix/pix-cobranca.cy.ts` |
| 26 | Login com credenciais inválidas é recusado | `cypress/e2e/login/login.cy.ts` |
| 27 | Saldo mascarado por padrão, revelado sob comando do usuário | `cypress/e2e/home/home.cy.ts` |
| 28 | Rota protegida bloqueada para quem não está autenticado | `cypress/e2e/auth/sessao.cy.ts` |
| 29 | Logout encerra a sessão e impede voltar à área logada | `cypress/e2e/auth/sessao.cy.ts` |

Cada cenário valida o **resultado**, não apenas a navegação: o login só passa
se a URL for `/home` **e** o menu renderizar; a transferência só passa se o
campo de valor contiver de fato `0,01`, **e** o toast de sucesso aparecer,
**e** o comprovante ficar disponível.

**No extrato, nenhuma asserção depende de valor fixo.** A conta de homologação
não tem massa controlada: hoje devolve zero lançamentos, amanhã pode devolver
cem. Então os cenários 13 e 15 verificam **relações que valem com qualquer
saldo** — o contador combina com o que está na tela, e toda data exibida cabe
no período filtrado. Um teste que espera "R$ 1.234,56 na linha 3" passa hoje e
mente amanhã.

Os cenários 1 e 2 são pré-condição de todo o resto. Os cenários 3 a 5 são o
caminho feliz e **movimentam dinheiro**. Os cenários 6 a 10 são validações e
caminhos alternativos: param antes do PIN e **não movimentam nada**, por isso
vivem em spec separada e podem rodar à vontade.

Os cenários 16 a 21 não movimentam dinheiro: param antes do "Concluir
Transferência". O cenário 22 movimenta, como os de Pix.

Há ainda três testes em `.skip`, que documentam defeitos de ausência de
feedback e de campo de data: a chave inexistente
deveria avisar o usuário. Ele não é falha da suíte — é a expectativa correta
registrada em código, esperando a correção do produto.

---

## 3. Tecnologias

- **Cypress 13** — runner E2E
- **TypeScript** — tipagem dos custom commands e dos seletores
- **Node.js 22**

---

## 4. Como instalar

```bash
git clone <url-do-repositorio>
cd delfinance
npm install
```

Depois, crie o arquivo de credenciais a partir do exemplo versionado:

```bash
cp cypress.env.example.json cypress.env.json
```

E preencha com dados válidos de homologação:

```json
{
  "documento": "00000000000",
  "conta": "000000",
  "senha": "sua-senha-de-homologacao",
  "chavePix": "chave-aleatoria-do-favorecido-de-teste",
  "codigoSMS": "000000"
}
```

`cypress.env.json` está no `.gitignore` e **não** vai para o repositório. A
chave Pix identifica uma conta e, nos formatos CPF/telefone/e-mail, é dado
pessoal: commitar deixaria o dado no histórico do Git para sempre.
`cypress/screenshots/` e `cypress/videos/` estão ignorados pelo mesmo motivo —
o Cypress salva print da tela em caso de falha, com saldo e chave visíveis. Um
cuidado extra vale para a cobrança: o BR Code gerado carrega **nome e cidade
do titular** dentro do próprio código, então um print dessa tela expõe mais do
que parece.

A leitura passa por `envObrigatoria()` (`cypress/support/env.ts`), que falha
com mensagem clara se faltar alguma variável. Sem isso, `Cypress.env()`
devolve `undefined` em silêncio e o erro só aparece comandos depois,
disfarçado de seletor que não casou.

---

## 5. Como executar

```bash
npm run cy:open      # modo interativo (UI), para desenvolver e depurar
npm run cy:run       # modo headless, suíte inteira
npm run typecheck    # valida os tipos sem executar teste nenhum
```

Uma feature isolada:

```bash
npm run test:login   # só o login
npm run test:home    # só a home
npm run test:pix     # só o Pix (executa transferência real, ver aviso abaixo)
```

**Relatório:** cada execução gera `cypress/reports/index.html`, via
`cypress-mochawesome-reporter`, com o resultado de cada cenário, a duração e
o screenshot da falha embutido no próprio arquivo. É a evidência que sobra
depois que o terminal fecha, e é ela que o CI publica como artefato — em
ambos os jobs, passando ou falhando.

Vídeo continua desligado no `cypress.config.ts`: grava credencial sendo
digitada. O relatório já embute screenshots da área logada, então vale o
mesmo cuidado de dado sensível.

As specs de Pix são duas, separadas por efeito colateral:

| spec | o que faz | movimenta dinheiro? |
|---|---|---|
| `pix.cy.ts` | caminho feliz: transferência e agendamento | **sim**, R$ 0,01 por cenário |
| `pix-validacoes.cy.ts` | validações de campo e caminhos alternativos | não, para antes do PIN |
| `ted.cy.ts` | caminho feliz do TED, com PIN e comprovante | **sim**, R$ 0,01 |
| `ted-validacoes.cy.ts` | validações do formulário de TED | não, para antes do envio |
| `pix-cobranca.cy.ts` | geração de QR Code e Copia e Cola | não, cobrar é pedir para receber |

> ⚠️ **`pix.cy.ts` executa transferências reais de R$ 0,01 a cada execução.**
> O teste não é idempotente: cada `npm run cy:run` movimenta saldo em
> homologação. Por isso a spec roda com `retries: 0` — com o padrão de 2 do
> projeto, uma falha depois do PIN refaria a transferência e enviaria três Pix
> numa execução.

---

## 6. Dificuldades encontradas

### 6.1 Ausência de massa de dados

Não havia data set, conta de teste documentada nem rotina de seed. As
consequências atravessam o projeto inteiro:

- **Os dados vieram do ambiente real de homologação.** Documento, conta, chave
  do favorecido e código SMS foram levantados manualmente e vivem em
  `cypress.env.json`, fora do Git. Quem clonar o repositório precisa dos
  próprios dados — a suíte não tem como se autoabastecer.
- **Não há como resetar estado.** Sem endpoint de setup/teardown, cada
  execução deixa rastro: transferências e agendamentos acumulam na conta. O
  valor de R$ 0,01 foi escolhido justamente para minimizar o efeito colateral
  de uma suíte que precisa rodar muitas vezes.
- **A verificação é só pela UI.** Sem acesso à API, não dá para confirmar no
  backend que o Pix foi efetivado: o teste acredita no que a tela mostra. Um
  `cy.intercept()` na chamada de confirmação seria o próximo passo, e
  permitiria assertar o contrato da API além do visual.
- **Sem massa, cenário negativo fica caro.** Saldo insuficiente exige conta
  zerada; chave inexistente exige uma chave sabidamente inválida e estável;
  PIN incorreto exige saber que o correto é outro. Cada um precisa de dado
  dedicado que hoje não existe.
- **`cypress/fixtures/` está vazio** — não por esquecimento, mas porque não há
  o que colocar lá sem massa definida.
- **O favorecido do TED é fictício, por autorização.** O formulário exige
  banco, agência, conta, tipo de conta e CPF/CNPJ de alguém em outra
  instituição, e a prova forneceu apenas `contaTed`, um número solto. Com o
  aval de quem administra o ambiente, o cenário usa favorecido inventado, com
  CPF de dígitos verificadores válidos. O ambiente aceitou e emitiu
  comprovante.
- **Dado fake vai para `fixtures/`, credencial não.** É a distinção que define
  onde cada coisa mora: `favorecido-ted.json` é sintético, então pode ser
  versionado e revisado junto do código; documento, conta, senha e chave Pix
  identificam alguém e ficam em `cypress.env.json`, fora do Git.
- **A conta só ganhou massa depois que a suíte a produziu.** Os cenários de
  extrato foram escritos com a conta zerada e, quando os TEDs de teste
  entraram, passaram a exercitar o caminho com dados sem reescrita — que era
  exatamente o objetivo do desenho por invariantes. Filtro por tipo, paginação
  e exportação continuam de fora: precisam de volume e variedade que três
  lançamentos não dão.

### 6.2 Ausência de `data-testid` no fluxo de Pix

Login, menu lateral e **TED** expõem `data-testid`, e a suíte usa. **O fluxo
de Pix não expõe nenhum** — é Vuetify puro.

Esse contraste é o argumento mais forte para pedir a correção: o formulário de
TED tem `ted-bank-select`, `ted-amount-input`, `ted-submit-button` e mais oito.
Não é limitação técnica do framework nem desconhecimento do time — é lacuna
pontual no Pix. Comparar as duas telas no mesmo sistema resolve a conversa. Foi preciso construir uma política de seletores do
zero ([seção 7](#7-política-de-seletores)), porque as âncoras que o framework
oferece à primeira vista (`#input-v-24`, `data-v-91763d41`) são geradas e
mudam sozinhas, sem ninguém ter tocado no produto.

Essa é a maior fonte de fragilidade do projeto hoje, e **a correção definitiva
não é do teste: é pedir `data-testid` ao time de front.** Com eles, cada
seletor vira uma linha estável e a política inteira deixa de ser necessária.

### 6.3 Modais empilhados

O Vuetify abre cada etapa como overlay e **mantém a etapa anterior no DOM**,
com os botões dela intactos. Um `cy.contains('button', 'Continuar')` encontra
o botão de trás — primeiro na ordem do DOM — e o clique morre no scrim:

```
cy.click() failed because this element is being covered by another element:
<div class="v-overlay__scrim"></div>
```

Resolvido pelo helper `clicarBotao()`, que escopa a busca no último
`[role="dialog"]` visível.

### 6.4 Autoenvio do PIN

O componente de código de 6 dígitos **envia sozinho** ao receber o último
dígito. Clicar em "Confirmar" depois disso é corrida perdida contra o modal
que já está desmontando:

```
cy.click() failed because the page updated while this command was executing
```

A falha era intermitente e dependia da velocidade do backend: passava quando o
servidor demorava, quebrava quando respondia rápido. Aumentar timeout não
resolveria — só mudaria a frequência. A correção foi remover o clique e
esperar **estado**, com `cy.aguardarPixConcluido()`.

### 6.5 Campos mascarados

Três campos com máscara, cada um exigindo abordagem diferente:

- **valor** — máscara da direita para a esquerda: digita-se `1` e o campo
  formata `R$ 0,01`. A asserção compara só a parte numérica, porque o `R$` vem
  separado por **espaço não-quebrável** (U+00A0). Comparar a string inteira
  produz o pior erro possível de depurar: `expected 'R$ 0,00' to equal
  'R$ 0,00'`, com as duas strings visualmente idênticas;
- **data** — `inputmode="none"`: teclado não entra, só o calendário muda a
  data;
- **chave Pix** — virou defeito, ver [8.1](#81-máscara-de-documento-no-campo-de-chave-pix).

---

## 7. Política de seletores

Sem `data-testid`, cada âncora foi escolhida nesta ordem, da mais estável para
a menos:

1. **Atributo de acessibilidade** — `[role="dialog"]`,
   `input[autocomplete="one-time-code"]`, `aria-label` dos dias do calendário.
   É contrato de HTML/ARIA: não muda com rebuild nem com upgrade de framework,
   e quebrá-lo quebraria leitor de tela junto.
2. **Texto visível** — label, placeholder, texto de botão. Só muda se o
   produto mudar, e aí o teste *deve* mesmo ser revisto.
3. **Classe estrutural do Vuetify** — `.v-input`. É API pública do framework,
   estável entre reinícios da aplicação; mudaria só num major upgrade.

O que foi **recusado**, porque o Vue regera sozinho:

| descartado | por quê |
|---|---|
| `#input-v-24` | contador de montagem do Vuetify; muda com a ordem dos campos na tela |
| `[data-v-91763d41]` | hash de escopo de estilo do Vue; muda a cada recompilação |
| `.v-btn--slim`, `.bg-submit` | refletem props visuais; morrem no primeiro redesign |

Exemplo concreto, no calendário: o dia é selecionado pelo `aria-label`
(`"30 de setembro de 2026"`), não pelo texto `"30"`. O texto pegaria também o
dia 30 do mês vizinho, que o Vuetify desenha nas bordas da grade — e o teste
passaria tendo agendado o mês errado.

---

## 8. Defeitos encontrados

A automação encontrou dois comportamentos que merecem abertura de defeito.

### 8.1 Máscara de documento no campo de chave Pix

**Severidade: alta** — impede a transferência.

O campo aplica formatação de CPF a partir do 3º caractere numérico e **não
desfaz** quando chegam letras. Chave aleatória digitada vira lixo:

```
digitado:  1234abcd-5e67-8f90-a1b2-c3d4e5f67890
no campo:  123.4abcd-5e67-8f90-a1b2-c3d4e5f67890
```

Na prática, o campo trata qualquer entrada que comece com dígitos como se
fosse documento ou telefone, e não reavalia quando o formato se revela outro.

O caso extremo apareceu montando o cenário negativo: uma chave composta só de
dígitos é **convertida em CNPJ e truncada**. A chave
`00000000-0000-0000-0000-000000000000` chega ao campo como
`00.000.000/0000-00` — 32 caracteres viram 18, e o que o servidor receberia
não tem relação com o que foi informado. Isso acontece mesmo quando o valor
entra por evento `input`, e não por digitação: a máscara classifica por
conteúdo, e a chave real só escapa porque tem letras.

**Medido:** a digitação falha, com e sem `delay` entre teclas. **Não medido:**
colar com Ctrl+V — o Cypress não dispara paste do sistema operacional. Há
indício de que colar funcione: setar o valor e emitir o evento `input` (o que
um paste real faz) não aciona a máscara, o que sugere que a formatação reage a
tecla, não a mudança de valor.

Impacto no teste: a chave é preenchida com `invoke('val') + trigger('input')`
em vez de `.type()`. É contorno, não solução — corrigido o defeito, o certo é
voltar para `.type()`, que exercita o caminho real do usuário.

### 8.2 Toast de agendamento diz "efetuada"

**Severidade: média** — induz o usuário a erro.

Uma transferência agendada para 30/09 devolve exatamente a mesma mensagem de
uma transferência imediata:

```
Transferência Pix efetuada com sucesso!
```

"Efetuada" e "agendada" são estados diferentes: o dinheiro saiu, ou vai sair.
O usuário não distingue um do outro pela mensagem, e pode reenviar achando que
não funcionou.

Impacto no teste: o toast não serve para diferenciar os cenários. O que prova
o agendamento é a asserção da data no campo (`30/09/2026`) antes da
confirmação.

### 8.3 Chave inexistente não produz feedback nenhum

**Severidade: alta** — o usuário fica sem saber o que aconteceu.

Com uma chave de formato válido e não cadastrada no DICT, o botão habilita
normalmente e o clique é aceito. Depois disso: **nada**. O fluxo não avança, e
também não aparece mensagem de erro, toast ou aviso no campo.

**Medido:** 16 amostras da tela a cada 500 ms, durante 8 segundos após o
clique, procurando `.v-snackbar`, `[role="alert"]`, `[role="status"]` e
qualquer modal. Nenhuma ocorrência. Um toast fugaz teria sido capturado nessa
malha — o de sucesso, por comparação, aparece e é detectado sem dificuldade.

Do ponto de vista do usuário, o botão simplesmente não funciona. A tendência
natural é clicar de novo, várias vezes, sem entender que o problema é a chave.

Impacto no teste: o cenário 7 asserta o que está **correto** no comportamento
atual — o fluxo não avança, o que protege contra um defeito pior, que seria
seguir com chave inválida. A expectativa de feedback fica registrada no teste
`.skip`, pronta para ser ativada quando o produto corrigir.

### 8.4 Campos de data do extrato apagam o separador e depois rejeitam o resultado

**Severidade: alta** — o filtro mostra um período e consulta outro.

Os dois campos de período (`A partir de` e `Até`) se comportam assim:

| digitado | fica no campo | depois do blur |
|---|---|---|
| `01/01/2025` | `01012025` | volta ao valor anterior |
| `01012025` | `01012025` | continua `01012025` |

O campo **remove as barras que o usuário digita** e em seguida rejeita o
próprio resultado, por não estar em `dd/mm/yyyy`. Digitar data pelo teclado é
impossível na prática.

O pior não é isso. Com `31122026` visível no campo, clicar em **Filtrar**
reverte silenciosamente para `23/09/2026` e consulta o período antigo — sem
mensagem, sem destaque. O usuário lê um período na tela e recebe outro na
tabela. Num extrato bancário, isso é conciliação errada.

**Medido:** valores lidos do input antes e depois do blur, e novamente após o
clique em Filtrar. O calendário, por outro lado, funciona: selecionar o dia 10
grava `10/09/2026` corretamente. Por isso `cy.selecionarPeriodo()` usa o
calendário, não digitação.

**O mesmo defeito aparece no TED**, com sintoma pior: digitar `01/01/2027` no
campo Data deixa `01012027` e, ao sair do campo, o valor **some por completo**.
Como são telas diferentes com o mesmo comportamento, a causa provável é um
componente de data compartilhado — o que torna a correção única e barata. O
teste em `.skip` de `ted-validacoes.cy.ts` registra a expectativa correta.

### 8.5 Formulário de TED acusa "Campo obrigatório" logo após o sucesso

**Severidade: baixa** — assusta sem motivo.

Concluída a transferência, o comprovante abre normalmente. Atrás dele, o
formulário é limpo e **dispara a validação nos campos recém-esvaziados**:
agência, conta, nome do favorecido, CPF/CNPJ e valor aparecem em vermelho com
"Campo obrigatório". Quem fecha o comprovante encontra cinco erros na tela
logo depois de uma operação bem-sucedida.

**Medido:** estado da tela 9 segundos após o envio, com o comprovante aberto —
cinco mensagens presentes, nenhuma ação pendente do usuário.

### 8.6 Pix executado não aparece no extrato

**Severidade: alta** — o cliente não vê para onde foi o dinheiro.

No extrato do mês corrente, com espera pela resposta da API e não pela tela,
aparecem **três lançamentos, todos "TED enviada"**. As transferências Pix
executadas na mesma conta e no mesmo dia não constam.

**O que sustenta o achado:** os TEDs funcionam como grupo de controle. Foram
executados pela mesma suíte, na mesma conta, no mesmo dia, e aparecem sem
atraso perceptível. Se o extrato estivesse apenas lento, ou o filtro de
período errado, os TEDs também faltariam.

A ausência também vale para **Agendamentos**: a listagem de
`GET /transactions?status=scheduled` traz apenas TEDs, embora um Pix tenha
sido agendado para 30/09. Ou seja, o Pix não aparece em nenhuma das duas
telas servidas pelos endpoints de transação.

**E os dados existem.** A home do mesmo sistema exibe "Transações (mês): 5
recentes · 2 Pix" e lista o favorecido dos Pix entre as transações recentes.
Não é atraso de compensação nem filtro de período: uma tela do produto conta e
mostra os Pix, outra finge que não existem. Duas telas do mesmo sistema se
contradizendo é o argumento que fecha o caso.

**O que falta verificar antes de abrir o defeito:** se o Pix tem extrato
próprio em outra tela, se depende do combo "Filtrar por" (lista de tipos ainda
não explorada), ou se entra com atraso de compensação. Os TEDs desta
verificação foram executados pela minha sessão; os Pix, pelo time — a
evidência de um lado é de primeira mão, a do outro é relatada.

### 8.7 TED para hoje é reagendada para o dia seguinte sem avisar

**Severidade: média** — o cliente acredita que o dinheiro saiu hoje.

Uma TED preenchida com a data de hoje (`23/09/2026` no campo) foi aceita, teve
PIN confirmado e comprovante emitido. O registro, porém, foi criado com
`effectiveAt = 2026-09-24`: entrou na fila de agendamentos para o dia seguinte,
e não no extrato.

**Medido:** contagem de agendamentos antes (3) e depois (4) do envio, com o
registro novo identificado pela descrição e trazendo a data seguinte. No mesmo
teste, o extrato não recebeu lançamento.

**A causa provável é o horário de corte**, e a evidência sustenta: os TEDs
executados às 16:45, 16:47 e 16:51 aparecem no extrato como efetivados; os
enviados a partir das 17:27 foram reagendados. O corte fica entre esses dois
horários, o que bate com o limite de 17h usual para TED.

Reagendar após o corte é comportamento bancário correto. **O defeito é o
silêncio**: nada na tela, no comprovante ou na mensagem indica que a data
mudou. O usuário sai achando que transferiu hoje.

### 8.8 Login inválido não produz feedback nenhum

**Severidade: alta** — o usuário não sabe se errou a senha ou se o sistema caiu.

Com documento e senha que não correspondem a nenhuma conta, o botão Entrar é
aceito, a tela permanece em `/login` e **nada mais acontece**: nenhum toast,
nenhuma mensagem no campo, nenhum aviso.

**Medido:** 16 amostras da tela a cada 500 ms, durante 8 s após o clique,
procurando `.v-snackbar`, `[role="alert"]`, `[role="status"]` e
`.v-messages__message`. Nenhuma ocorrência.

É o mesmo padrão da chave Pix inexistente: o sistema recusa corretamente, mas
não comunica. Num login, o efeito é pior — o usuário repete a tentativa várias
vezes, e cada repetição pode aproximá-lo de um bloqueio por tentativas.

O teste do cenário 26 asserta o que **está correto** (não autenticar, não abrir
a área logada). A expectativa de feedback fica num `.skip`, pronta para ser
ativada quando o produto corrigir.

### 8.9 Texto de carregamento em inglês

**Severidade: baixa** — cosmético, mas visível ao usuário final.

A tabela do extrato exibe `Loading items...` enquanto busca os dados, num
produto inteiramente em português. O teste usa esse texto como sinal de
sincronismo (`cy.aguardarExtratoCarregar()`), então, quando for traduzido,
basta atualizar `extrato.elements.ts`.

---

## 9. Arquitetura

```
cypress/
├── commands/                  # custom commands (cy.algumaCoisa)
│   ├── auth/                  # cy.clearAuth()
│   ├── common/                # validações genéricas
│   ├── home/                  # cy.visitHome()
│   ├── login/                 # cy.login()
│   ├── pix/                   # cy.preencherTransferenciaPix(), cy.agendarPixPara(), ...
│   └── index.ts               # registra todos os módulos
├── e2e/                       # os testes, um diretório por feature
│   ├── home/home.cy.ts
│   ├── login/login.cy.ts
│   └── pix/pix.cy.ts
├── elements/                  # seletores centralizados
│                              # menu.elements.ts tem os data-testid do sidebar
├── fixtures/                  # massa de dados (vazio — ver 6.1)
├── support/
│   ├── e2e.ts                 # carregado antes de toda spec
│   └── env.ts                 # leitura de env com falha explícita
└── utils/                     # funções puras, sem Cypress dentro
```

**`elements/`** — nenhum seletor fica escrito dentro de teste. Se o front
trocar o `data-testid` do botão de login, muda-se **uma linha** e a suíte
inteira volta a passar.

**`commands/`** — ações repetidas viram `cy.login()`, `cy.agendarPixPara()`.
Cada `*.commands.ts` declara seus tipos no bloco `declare global`, então o
autocomplete funciona em `cy.` sem configuração extra.

**`utils/`** — funções puras, sem Cypress dentro: `apenasDigitos()` para
campos com máscara, `paraDataBR()` e `paraDiaPorExtenso()` para o calendário.

**Imports por alias** — `@elements/`, `@commands/`, `@utils/`, `@support/`,
declarados no `tsconfig.json` e resolvidos também em runtime pelo
preprocessador do Cypress. Some o `../../` das specs, e mover um arquivo de
lugar deixa de ser um exercício de contar diretórios.

### O command de login

```ts
beforeEach(() => {
  cy.login(envObrigatoria('documento'), envObrigatoria('conta'), envObrigatoria('senha'));
});
```

Visita `/login`, ativa a aba **Documento**, preenche os três campos, clica em
Entrar e **valida que o login deu certo**: URL em `/home` e menu lateral
visível. As duas asserções juntas evitam dar o login por bom só porque a URL
mudou, antes de a tela carregar.

### Decisões que não são óbvias no código

**Espera de rede onde a tela engana.** O extrato renderiza "não existem
lançamentos" **enquanto** a requisição está no ar. Quem espera só o DOM lê
esse estado e conclui que a conta está vazia — foi o que aconteceu aqui, e só
apareceu quando a conta ganhou lançamentos. A correção foi interceptar
`GET /internet-banking/v1/transactions/bank-statement` e esperar a resposta,
assertando o status junto: tela vazia por ausência de dado e tela vazia por
erro de API são idênticas aos olhos e opostas no significado.

**Asserção cruzando API e tela na cobrança.** O que a API devolve tem de ser
o que o usuário vê: o teste compara o `imageBase64` da resposta com o `src` da
imagem renderizada, e o `payload` com o código exibido. Olhando só a tela, um
QR antigo em cache passaria; olhando só a API, uma tela que parou de renderizar
passaria também.

**`should(callback)` no lugar de `then()` para ler tabela.** O `should` repete
a verificação até passar, o que absorve o intervalo entre a resposta chegar e
o Vue re-renderizar. Com `then()`, o teste leu a tabela anterior e acusou um
lançamento fora do período filtrado — defeito que não existia. Vale o
registro: a primeira versão desse teste reportaria um falso positivo.

**Espera de estado, nunca de tempo.** Não há um `cy.wait(ms)` na suíte.
`cy.aguardarPixConcluido()` espera duas transições separadas — os campos de
PIN sumirem (backend respondeu) e o toast aparecer (resposta foi de sucesso) —
de propósito: assim o erro distingue "não processou" de "processou e deu
errado". Num teste de pagamento, essa é a diferença entre reexecutar e
investigar.

**`retries: 0` só na spec de Pix.** No resto do projeto, retry é rede de
segurança contra instabilidade de ambiente. Aqui, retry é dinheiro saindo de
novo.

**Senha e código SMS digitados com `{ log: false }`**, senão aparecem em texto
puro no relatório e nos screenshots de falha.

**Asserção junto do campo, não depois da navegação.** O valor é conferido
dentro de `cy.preencherTransferenciaPix()`, antes do "Continuar" — uma etapa
adiante o campo não existe mais e a asserção viraria "elemento não
encontrado", escondendo o que se queria validar.

---

## 10. CI/CD (GitHub Actions)

O workflow está em `.github/workflows/e2e.yml` e é dividido por **efeito
colateral**, não por tipo de teste:

| gatilho | o que roda | movimenta dinheiro? |
|---|---|---|
| `push` na main, `pull_request` | typecheck + validações (cenários 1, 2, 6 a 10) | não |
| `workflow_dispatch` com confirmação | caminho feliz do Pix (cenários 3 a 5) | **sim** |

Rodar o caminho feliz a cada commit significaria uma transferência por push,
com o extrato da conta de homologação virando log de CI. Por isso ele só roda
sob demanda, com um checkbox de confirmação e um `environment` protegido — é
só configurar *Required reviewers* em **Settings → Environments →
homologacao-pix** para exigir aprovação humana antes de cada execução.

### Secrets necessários

Em **Settings → Secrets and variables → Actions**, crie:

| secret | conteúdo |
|---|---|
| `CYPRESS_DOCUMENTO` | CPF/CNPJ do login |
| `CYPRESS_CONTA` | número da conta |
| `CYPRESS_SENHA` | senha de homologação |
| `CYPRESS_CHAVE_PIX` | chave do favorecido de teste |
| `CYPRESS_CODIGO_SMS` | código fixo de homologação |

O workflow mapeia cada um para uma variável **em minúsculas**
(`CYPRESS_documento`, `CYPRESS_chavePix`, ...). Não é descuido: o Cypress corta
o prefixo `CYPRESS_` e usa o que sobra como chave de `Cypress.env()`, que é
sensível a maiúsculas. Os secrets do GitHub são maiúsculos, então a tradução
acontece no `env:` do job.

Verificado localmente na condição exata do runner — `cypress.env.json` ausente,
credenciais só em `CYPRESS_*`: a suíte passa. E, se faltar um secret,
`envObrigatoria()` falha com o nome da variável e o que fazer nos dois
ambientes, em vez de estourar num seletor qualquer três comandos adiante.

### Detalhes que evitam dor de cabeça

- **`concurrency: e2e-homologacao`** — a suíte inteira usa a mesma conta. Duas
  execuções simultâneas disputariam sessão e saldo, então elas entram em fila.
  `cancel-in-progress: false` de propósito: cancelar no meio de uma
  transferência é pior do que esperar.
- **PR de fork não roda os testes.** Fork não recebe secrets, e o job falharia
  com erro de credencial disfarçado de bug. O `if` do job corta antes.
- **Typecheck sem baixar o Cypress** (`CYPRESS_INSTALL_BINARY: 0`) — são
  ~250 MB que não servem para compilar tipos, e é o feedback mais rápido do PR.
- **Relatório publicado em todo run**, passando ou falhando — é a evidência
  de execução, e evidência só de falha não comprova o que passou. Retenção de
  1 dia: o HTML embute screenshots da tela logada, com saldo, conta, chave e
  nome do titular. Em repositório público, avalie desligar o upload.

Localmente, os mesmos comandos do CI:

```bash
npm run test:ci              # o que roda em cada push
npm run test:transferencias  # o que movimenta dinheiro
```

---

## 11. Próximos passos

- **Cenários negativos que faltam**: saldo insuficiente e valor acima do
  limite dependem de massa de dados dedicada (6.1). **PIN incorreto** é o mais
  valioso dos três e o mais arriscado de automatizar sem combinar antes: se o
  produto bloquear a conta após N tentativas erradas, a execução do teste
  inutiliza o ambiente de homologação para todo mundo
- **`cy.intercept()` também nas confirmações de Pix e TED**, para assertar o
  contrato da API além do resultado visual. No extrato isso já é feito
- **Validar o agendamento de Pix fora do fluxo**, como já é feito no TED.
  Hoje é impossível: o Pix não aparece na listagem de agendamentos (8.6)
- **Baixar o comprovante** e validar o arquivo em `cypress/downloads`
- **Data relativa no agendamento**: hoje é fixa em 30/09/2026 porque a prova
  pediu essa data. A partir de 01/10/2026 o calendário não a oferece mais e o
  teste quebra sozinho — em CI, o certo é `hoje + 7 dias`
- **`cy.session()`** para cachear o login quando a suíte crescer
- **Revisar `Cypress.on('uncaught:exception', () => false)`** em
  `support/e2e.ts`: hoje engole qualquer erro de JavaScript da aplicação,
  inclusive um que ocorra durante a transferência. O certo é filtrar por
  mensagem conhecida e deixar o resto derrubar o teste
- **Extrato**: filtro por tipo, paginação e "Exportar Extrato" — todos
  dependem de a conta ter lançamento
- **Investigar o Pix ausente no extrato** (8.6): conferir o combo "Filtrar
  por", a tela de Agendamentos e um eventual extrato específico de Pix
 - **Cobrança por boleto** (`/cobrancas/nova-cobranca`) está bloqueada: a conta
  de teste não tem permissão de cedente, e a própria tela informa isso. A
  cobrança coberta hoje é a do fluxo de Pix
