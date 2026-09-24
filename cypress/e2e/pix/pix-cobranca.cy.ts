import { cobrancaElements } from '@elements/cobranca.elements';

describe('Pix — cobrança', () => {
  const VALOR_EM_CENTAVOS = '150';

  beforeEach(() => {
    cy.login(Cypress.env('documento'), Cypress.env('conta'), Cypress.env('senha'));
    cy.visitPix();
    cy.contains(cobrancaElements.cardCobrar).should('be.visible').click();

    cy.contains(cobrancaElements.tituloSelecaoDeChave).should('be.visible');
    cy.contains(cobrancaElements.textoChaveAleatoria).should('be.visible').click();
  });

  it('gera cobrança por QR Code e exibe a imagem devolvida pela API', () => {
    cy.get(cobrancaElements.radioQrCode).should('be.checked');

    cy.gerarCobranca(VALOR_EM_CENTAVOS).then((cobranca) => {
      expect(cobranca.payload, 'BR Code').to.contain(cobrancaElements.prefixoBrCode);
      expect(cobranca.payload, 'valor dentro do BR Code').to.contain('1.50');
      expect(cobranca.imageBase64, 'imagem do QR').to.not.be.empty;

      cy.get('img[src^="data:image"]')
        .should('have.length.at.least', 1)
        .then(($imgs) => {
          const fontes = $imgs.map((_i, img) => img.getAttribute('src') ?? '').get();
          const exibida = fontes.some((src) => src.includes(cobranca.imageBase64.slice(0, 80)));

          expect(exibida, 'QR da resposta renderizado na tela').to.be.true;
        });
    });
  });

  it('gera cobrança por Copia e Cola e exibe o código para o usuário', () => {
    // force: o Vuetify cobre o input do rádio, e clicar no texto não marca a opção.
    cy.get(cobrancaElements.radioCopiaECola).click({ force: true });
    cy.get(cobrancaElements.radioCopiaECola).should('be.checked');

    cy.gerarCobranca(VALOR_EM_CENTAVOS).then((cobranca) => {
      expect(cobranca.payload, 'BR Code').to.contain(cobrancaElements.prefixoBrCode);

      // O código pode estar no value de um campo, que cy.contains() não lê.
      cy.get('body').should(($corpo) => {
        const valores = $corpo
          .find('input, textarea')
          .map((_i, campo) => (campo as unknown as HTMLInputElement).value ?? '')
          .get();
        const emCampos = valores.some((valor) => valor.includes(cobranca.payload));
        const emTexto = ($corpo[0].innerText ?? '').includes(cobranca.payload);

        expect(emCampos || emTexto, 'código Copia e Cola disponível na tela').to.be.true;
      });
    });
  });
});
