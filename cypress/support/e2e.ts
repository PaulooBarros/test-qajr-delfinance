import 'cypress-mochawesome-reporter/register';

import '../commands';

// Erros não tratados do app não derrubam o teste; asserções de erro ficam na spec.
Cypress.on('uncaught:exception', () => false);
