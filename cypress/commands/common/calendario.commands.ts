import { comumElements } from '@elements/comum.elements';

declare global {
  namespace Cypress {
    interface Chainable {
      /** Avança um mês e escolhe o primeiro dia útil. Devolve a data do campo (dd/mm/aaaa). */
      escolherDataFuturaNoCalendario(campoDeData: string): Chainable<string>;
    }
  }
}

Cypress.Commands.add('escolherDataFuturaNoCalendario', (campoDeData: string) => {
  cy.get(comumElements.botaoCalendarioProximoMes).click();

  // A troca de mês é animada e, enquanto dura, as duas grades ficam no DOM.
  // Sem esperar, o clique caía no mês antigo (hoje) e o agendamento virava imediato.
  cy.get(comumElements.gradeCalendario).should('have.length', 1);

  // Fim de semana fica de fora: o backend do TED remarca para o dia útil seguinte.
  cy.get(`${comumElements.botaoCalendarioDia}:not([disabled])`)
    .filter((_i, botao) => !/^(sábado|domingo)/i.test(botao.getAttribute('aria-label') ?? ''))
    .first()
    .click();

  return cy.get(campoDeData).invoke('val').then(String);
});

export {};
