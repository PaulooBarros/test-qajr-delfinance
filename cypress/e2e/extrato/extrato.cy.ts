import { extratoElements } from '@elements/extrato.elements';
import { menuElements } from '@elements/menu.elements';
import { envObrigatoria } from '@support/env';
import { deDataBR, paraDataBR, primeiroDiaDoMes } from '@utils';

/**
 * Consulta de extrato.
 *
 * A conta de homologação não tem massa controlada: hoje ela devolve zero
 * lançamentos, amanhã pode devolver cem. Por isso nenhuma asserção aqui
 * depende de um valor específico na tabela — todas verificam **relações que
 * valem com qualquer saldo**: o contador combina com o que está na tela, as
 * datas exibidas cabem no período filtrado, os filtros voltam ao padrão.
 *
 * Um teste que espera "R$ 1.234,56 na linha 3" passa hoje e amanhã não.
 */
describe('Extrato', () => {
  const hoje = new Date();

  beforeEach(() => {
    // Antes da navegação: o teste de menu clica direto para o extrato, e o
    // intercept precisa já estar registrado quando a requisição sai.
    cy.interceptarExtrato();
    cy.login(envObrigatoria('documento'), envObrigatoria('conta'), envObrigatoria('senha'));
  });

  it('é alcançável pelo menu lateral', () => {
    cy.get(menuElements.itemExtrato).should('be.visible').click();

    cy.shouldBeOnPath('/contas/extrato');
    cy.aguardarExtratoCarregar();

    // As colunas são o contrato da tela: se alguma sumir ou trocar de ordem,
    // todo teste que lê a tabela passa a ler a coluna errada.
    cy.get('th').then(($ths) => {
      const exibidas = $ths.map((_i, th) => th.textContent?.trim()).get().filter(Boolean);

      expect(exibidas).to.include.members([...extratoElements.colunas]);
    });
  });

  it('abre com o período padrão: do primeiro dia do mês até hoje', () => {
    cy.visitExtrato();

    cy.campoPeriodo(extratoElements.labelDataInicial).should(
      'have.value',
      paraDataBR(primeiroDiaDoMes(hoje)),
    );
    cy.campoPeriodo(extratoElements.labelDataFinal).should('have.value', paraDataBR(hoje));
  });

  it('mantém contador e tabela coerentes entre si', () => {
    cy.visitExtrato();

    // Invariante, não valor fixo: ou o extrato declara zero e mostra o estado
    // vazio, ou declara mais que zero e mostra linha. Declarar zero com linha
    // na tela (ou o contrário) é o defeito que este teste pega.
    cy.totalDeLancamentos().then((total) => {
      if (total === 0) {
        cy.contains(extratoElements.mensagemSemLancamentos).should('be.visible');

        return;
      }

      cy.contains(extratoElements.mensagemSemLancamentos).should('not.exist');
      cy.get(extratoElements.linhas).should('have.length.at.least', 1);
    });
  });

  it('restaura o período padrão ao limpar os filtros', () => {
    cy.visitExtrato();

    // Uma data qualquer dentro do mês corrente, só para sair do padrão. O dia
    // 10 é escolhido por estar sempre disponível no calendário aberto.
    const dataEscolhida = new Date(hoje.getFullYear(), hoje.getMonth(), 10);

    cy.selecionarPeriodo(extratoElements.labelDataFinal, dataEscolhida);

    cy.contains('button', extratoElements.botaoLimpar).should('be.enabled').click();

    cy.campoPeriodo(extratoElements.labelDataFinal).should('have.value', paraDataBR(hoje));
    cy.campoPeriodo(extratoElements.labelDataInicial).should(
      'have.value',
      paraDataBR(primeiroDiaDoMes(hoje)),
    );
  });

  it('filtra por período e não exibe lançamento fora do intervalo', () => {
    cy.visitExtrato();

    const inicio = primeiroDiaDoMes(hoje);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), 10);

    cy.selecionarPeriodo(extratoElements.labelDataFinal, fim);

    cy.contains('button', extratoElements.botaoFiltrar).should('be.enabled').click();
    cy.aguardarExtratoCarregar();

    // should(callback) e não then(): o should repete a verificação até passar
    // ou estourar o timeout, o que absorve o intervalo entre a resposta
    // chegar e o Vue re-renderizar a tabela. Com then(), o teste leria a
    // tabela antiga e acusaria um defeito que não existe.
    cy.get('body').should(($corpo) => {
      const linhas = $corpo.find(extratoElements.linhas);
      const indiceDaColunaData = extratoElements.colunas.indexOf('Data');

      linhas.each((_i, linha) => {
        const celula = Cypress.$(linha).find('td').eq(indiceDaColunaData).text().trim();

        // Linha do estado vazio não tem célula de data.
        if (!/\d{2}\/\d{2}\/\d{4}/.test(celula)) return;

        const data = deDataBR(celula);

        expect(data.getTime(), `lançamento de ${celula} dentro do período`)
          .to.be.within(inicio.getTime(), fim.getTime());
      });
    });
  });
});
