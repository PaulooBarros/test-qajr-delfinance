import { cobrancaElements } from '@elements/cobranca.elements';
import { envObrigatoria } from '@support/env';
import { centavosParaValorBR } from '@utils';

/**
 * Cobrança Pix — geração de QR Code e de código Copia e Cola.
 *
 * Não movimenta dinheiro: cobrança é pedido de recebimento, não pagamento.
 * Por isso esta spec roda junto das demais no CI.
 *
 * As asserções cruzam duas camadas: o que a API devolveu tem de ser o que a
 * tela mostra. Um teste que olhasse só a tela passaria com um QR antigo em
 * cache; um que olhasse só a API não perceberia a tela deixando de renderizar.
 *
 * Nada do que identifica a conta — a chave e o nome do titular, que vêm
 * dentro do BR Code — é escrito aqui: as comparações usam o valor que a API
 * devolveu em tempo de execução.
 */
describe('Pix — cobrança', () => {
  const VALOR_EM_CENTAVOS = '150';

  beforeEach(() => {
    cy.login(envObrigatoria('documento'), envObrigatoria('conta'), envObrigatoria('senha'));
    cy.iniciarCobrancaPix();
  });

  it('gera cobrança por QR Code e exibe a imagem devolvida pela API', () => {
    cy.get(cobrancaElements.tipoQrCode).should('be.checked');

    cy.gerarCobranca(VALOR_EM_CENTAVOS).then((cobranca) => {
      // BR Code do padrão EMV: começa com o identificador do formato e carrega
      // o valor cobrado. Validar o conteúdo evita dar por boa uma resposta 200
      // com payload vazio.
      expect(cobranca.payload, 'BR Code').to.contain(cobrancaElements.prefixoBrCode);
      expect(cobranca.payload, 'valor dentro do BR Code').to.contain(
        centavosParaValorBR(VALOR_EM_CENTAVOS).replace(',', '.'),
      );
      expect(cobranca.imageBase64, 'imagem do QR').to.not.be.empty;

      // A imagem na tela precisa ser a que acabou de ser gerada, não outra.
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
    // O clique vai no input do rádio: o Vuetify cobre o campo, e clicar no
    // texto ao lado não marca a opção — o formulário seguiria como QR Code e
    // o teste validaria o cenário errado.
    cy.get(cobrancaElements.tipoCopiaECola).click({ force: true });
    cy.get(cobrancaElements.tipoCopiaECola).should('be.checked');

    cy.gerarCobranca(VALOR_EM_CENTAVOS).then((cobranca) => {
      expect(cobranca.payload, 'BR Code').to.contain(cobrancaElements.prefixoBrCode);

      // Aqui o entregável ao usuário é o texto: sem ele na tela, não há o que
      // copiar, e a cobrança não chega a ninguém.
      //
      // Nada de cy.contains(): o código é exibido dentro do value de um campo,
      // e o contains procura conteúdo de texto, não valor de input. A busca
      // cobre os dois lugares, e o should(callback) repete até a tela
      // terminar de renderizar.
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
