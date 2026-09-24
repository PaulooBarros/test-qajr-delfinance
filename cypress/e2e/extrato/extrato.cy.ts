import { extratoElements } from '@elements/extrato.elements';
import { menuElements } from '@elements/menu.elements';

describe('Extrato', () => {
  const hoje = new Date();
  const primeiroDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const diaDez = new Date(hoje.getFullYear(), hoje.getMonth(), 10);

  beforeEach(() => {
    cy.interceptarExtrato();
    cy.login(Cypress.env('documento'), Cypress.env('conta'), Cypress.env('senha'));
  });

  it('é alcançável pelo menu lateral', () => {
    cy.get(menuElements.itemExtrato).should('be.visible').click();

    cy.location('pathname').should('include', '/contas/extrato');
    cy.aguardarExtratoCarregar();

    cy.get('th').then(($ths) => {
      const exibidas = $ths.map((_i, th) => th.textContent?.trim()).get().filter(Boolean);

      expect(exibidas).to.include.members([...extratoElements.colunasDaTabela]);
    });
  });

  it('abre com o período padrão: do primeiro dia do mês até hoje', () => {
    cy.visitExtrato();

    // new Date() é seguro: o período padrão é calculado no front, com o mesmo
    // relógio do navegador (medido congelando o relógio em outra data).
    cy.campoPeriodo(extratoElements.rotuloDataInicial).should(
      'have.value',
      primeiroDiaDoMes.toLocaleDateString('pt-BR'),
    );
    cy.campoPeriodo(extratoElements.rotuloDataFinal).should(
      'have.value',
      hoje.toLocaleDateString('pt-BR'),
    );
  });

  it('mantém contador e tabela coerentes entre si', () => {
    cy.visitExtrato();

    // O rodapé vem com quebras de linha entre as palavras; sem normalizar, lê zero.
    cy.get('body').then(($body) => {
      const rodape = $body.text().replace(/\s+/g, ' ');
      const total = Number(rodape.match(extratoElements.textoContador)?.[1] ?? 0);

      if (total === 0) {
        cy.contains(extratoElements.mensagemSemLancamentos).should('be.visible');

        return;
      }

      cy.contains(extratoElements.mensagemSemLancamentos).should('not.exist');
      cy.get(extratoElements.linhasDaTabela).should('have.length.at.least', 1);
    });
  });

  it('restaura o período padrão ao limpar os filtros', () => {
    cy.visitExtrato();

    cy.selecionarPeriodo(extratoElements.rotuloDataFinal, diaDez);

    cy.contains('button', extratoElements.botaoLimpar).should('be.enabled').click();

    cy.campoPeriodo(extratoElements.rotuloDataFinal).should(
      'have.value',
      hoje.toLocaleDateString('pt-BR'),
    );
    cy.campoPeriodo(extratoElements.rotuloDataInicial).should(
      'have.value',
      primeiroDiaDoMes.toLocaleDateString('pt-BR'),
    );
  });

  it('filtra por período e não exibe lançamento fora do intervalo', () => {
    cy.visitExtrato();

    cy.selecionarPeriodo(extratoElements.rotuloDataFinal, diaDez);

    cy.contains('button', extratoElements.botaoFiltrar).should('be.enabled').click();
    cy.aguardarExtratoCarregar();

    // should(callback) repete até o Vue re-renderizar; then() leria a tabela antiga.
    cy.get('body').should(($corpo) => {
      const indiceDaColunaData = extratoElements.colunasDaTabela.indexOf('Data');

      $corpo.find(extratoElements.linhasDaTabela).each((_i, linha) => {
        const celula = Cypress.$(linha).find('td').eq(indiceDaColunaData).text();
        const encontrado = celula.match(/(\d{2})\/(\d{2})\/(\d{4})/);

        // Linha do estado vazio não tem data.
        if (!encontrado) return;

        const [, dia, mes, ano] = encontrado.map(Number);
        const data = new Date(ano, mes - 1, dia);

        expect(data.getTime(), `lançamento de ${encontrado[0]} dentro do período`)
          .to.be.within(primeiroDiaDoMes.getTime(), diaDez.getTime());
      });
    });
  });
});
