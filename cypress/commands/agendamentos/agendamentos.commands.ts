import { menuElements } from '@elements/menu.elements';

/** Endpoint que lista os agendamentos pendentes. */
const ROTA_AGENDAMENTOS = '**/transactions?status=scheduled*';

/** Registro de agendamento, como a API devolve. */
export interface Agendamento {
  id: string;
  amount: number;
  notes: string;
  createdAt: string;
  effectiveAt: string;
}

declare global {
  namespace Cypress {
    interface Chainable {
      /** Registra o intercept dos agendamentos. Precisa vir antes da navegação. */
      interceptarAgendamentos(): Chainable<void>;

      /** Abre Agendamentos pelo menu e devolve o que a API respondeu. */
      visitAgendamentos(): Chainable<Agendamento[]>;
    }
  }
}

Cypress.Commands.add('interceptarAgendamentos', () => {
  cy.intercept('GET', ROTA_AGENDAMENTOS).as('agendados');
});

Cypress.Commands.add('visitAgendamentos', () => {
  cy.interceptarAgendamentos();

  // force: true porque o menu pode estar coberto por um modal recém-fechado,
  // cuja animação de saída ainda não terminou.
  cy.get(menuElements.itemAgendamentos).click({ force: true });

  // A resposta é a fonte da verdade: a tabela não exibe a descrição, então é
  // pela API que se identifica *qual* agendamento foi criado por este teste.
  return cy.wait('@agendados').then((interceptacao) => {
    expect(interceptacao.response?.statusCode, 'status da listagem').to.eq(200);

    return (interceptacao.response?.body ?? []) as Agendamento[];
  });
});

export {};
