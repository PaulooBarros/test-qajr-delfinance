import 'cypress-mochawesome-reporter/register';

import '../commands';

/**
 * Erros não tratados do app não devem derrubar o teste automaticamente.
 * Se precisar validar um erro específico, faça a asserção dentro da spec.
 */
Cypress.on('uncaught:exception', () => false);

beforeEach(() => {
  cy.clearAuth();
});
