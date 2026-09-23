import { defineConfig } from 'cypress';

export default defineConfig({
  /**
   * Relatório HTML com o resultado de cada cenário e o screenshot da falha
   * embutido — é a evidência de execução que sobra depois que o terminal
   * fecha, e o que o CI publica como artefato.
   */
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    charts: true,
    reportPageTitle: 'DelFinance — E2E',
    embeddedScreenshots: true,
    inlineAssets: true,
    // O relatório carrega screenshots da área logada: saldo, chave Pix e nome
    // do titular. Tratar como dado sensível, igual aos prints soltos.
    overwrite: true,
    html: true,
    json: false,
  },

  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL ?? 'https://ib-hml.delfinance.com.br',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    downloadsFolder: 'cypress/downloads',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 1366,
    viewportHeight: 768,
    // Ambiente remoto costuma responder mais devagar que localhost.
    defaultCommandTimeout: 15000,
    pageLoadTimeout: 60000,
    requestTimeout: 20000,
    responseTimeout: 20000,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    env: {
      // Credenciais reais ficam em cypress.env.json (fora do Git).
      documento: '',
      conta: '',
      senha: '',
      chavePix: '',
      codigoSMS: '',
    },
    setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('cypress-mochawesome-reporter/plugin')(on);

      on('task', {
        log(message: string) {
          console.log(message);
          return null;
        },
      });

      return config;
    },
  },
});
