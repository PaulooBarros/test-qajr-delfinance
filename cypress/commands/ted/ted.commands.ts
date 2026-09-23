import { tedElements } from '@elements/ted.elements';
import { paraDiaPorExtenso } from '@utils';

/** Dados do favorecido, vindos de cypress/fixtures/favorecido-ted.json. */
export interface FavorecidoTed {
  banco: string;
  nomeDoBanco: string;
  agencia: string;
  conta: string;
  tipoDeConta: string;
  nome: string;
  email: string;
  documento: string;
}

declare global {
  namespace Cypress {
    interface Chainable {
      /** Abre o formulário de TED e espera ele renderizar. */
      visitTed(): Chainable<void>;

      /**
       * Input interno de um campo do TED. O data-testid está no componente
       * Vuetify (um div), não no <input>: digitar direto no wrapper não
       * chega ao campo.
       */
      campoTed(elemento: string): Chainable<JQuery<HTMLInputElement>>;

      /** Busca o banco pelo código no autocomplete e seleciona o resultado. */
      selecionarBanco(codigo: string): Chainable<void>;

      /** Escolhe o tipo de conta na lista (Corrente, Pagamento, Poupança). */
      selecionarTipoDeConta(tipo: string): Chainable<void>;

      /** Escolhe a data da transferência pelo calendário. */
      selecionarDataTed(data: Date): Chainable<void>;

      /** Preenche o formulário inteiro e para antes de concluir. */
      preencherTed(
        favorecido: FavorecidoTed,
        centavos: string,
        descricao: string,
        data?: Date,
      ): Chainable<void>;
    }
  }
}

Cypress.Commands.add('visitTed', () => {
  cy.visit('/transferencias/ted');

  cy.get(tedElements.botaoConcluir).should('be.visible');
});

Cypress.Commands.add('campoTed', (elemento: string) => {
  return cy.get(elemento).find('input') as Cypress.Chainable<JQuery<HTMLInputElement>>;
});

/**
 * Abre a lista de um select. O clique vai no `.v-field` e não no input: o
 * Vuetify aplica `pointer-events: none` no input interno dos selects, e o
 * Cypress recusa clicar em elemento não interativo — com razão, porque o
 * usuário também não conseguiria.
 */
const abrirLista = (elemento: string) => cy.get(elemento).find('.v-field').click();

Cypress.Commands.add('selecionarBanco', (codigo: string) => {
  cy.campoTed(tedElements.campos.banco).clear().type(codigo);

  // A lista abre num overlay fora do formulário: escopar nele evita casar com
  // o menu lateral, que também é uma lista de itens.
  cy.get('.v-overlay--active').contains('.v-list-item', codigo).should('be.visible').click();

  cy.campoTed(tedElements.campos.banco).should('contain.value', codigo);
});

Cypress.Commands.add('selecionarTipoDeConta', (tipo: string) => {
  abrirLista(tedElements.campos.tipoDeConta);

  cy.get('.v-overlay--active').contains('.v-list-item', tipo).should('be.visible').click();

  cy.campoTed(tedElements.campos.tipoDeConta).should('have.value', tipo);
});

Cypress.Commands.add('selecionarDataTed', (data: Date) => {
  // Digitar não funciona: o campo apaga as barras e descarta o valor no blur
  // — mesmo defeito dos campos de data do extrato, descrito no README. O
  // calendário é o caminho que resta.
  abrirLista(tedElements.campos.data);

  cy.get(`button[aria-label*="${paraDiaPorExtenso(data)}"]`).should('be.visible').click();
});

Cypress.Commands.add(
  'preencherTed',
  (favorecido: FavorecidoTed, centavos: string, descricao: string, data: Date = new Date()) => {
    cy.selecionarBanco(favorecido.banco);
    cy.campoTed(tedElements.campos.agencia).clear().type(favorecido.agencia);
    cy.campoTed(tedElements.campos.conta).clear().type(favorecido.conta);
    cy.selecionarTipoDeConta(favorecido.tipoDeConta);

    cy.campoTed(tedElements.campos.nomeFavorecido).clear().type(favorecido.nome);
    cy.campoTed(tedElements.campos.email).clear().type(favorecido.email);
    cy.campoTed(tedElements.campos.documento).clear().type(favorecido.documento);

    cy.campoTed(tedElements.campos.valor).clear().type(centavos);
    cy.selecionarDataTed(data);
    cy.campoTed(tedElements.campos.descricao).clear().type(descricao);
  },
);

export {};
