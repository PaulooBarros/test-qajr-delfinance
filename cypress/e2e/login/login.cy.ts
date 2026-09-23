import { homeElements } from '@elements/home.elements';
import { loginElements } from '@elements/login.elements';
import { envObrigatoria } from '@support/env';

describe('Login', () => {
  /** CPF de formato válido, sem conta associada no ambiente. */
  const DOCUMENTO_INEXISTENTE = '52998224725';

  it('caminho feliz: autentica com documento, conta e senha válidos', () => {
    cy.login(
      envObrigatoria('documento'),
      envObrigatoria('conta'),
      envObrigatoria('senha'),
    );

    // O cy.login() já valida URL e menu por dentro. As asserções aqui deixam
    // o critério de aceite explícito na leitura da spec.
    cy.shouldBeOnPath('/home');
    cy.shouldBeVisible(homeElements.botaoMenuHome);
  });

  it('recusa credenciais inválidas e não abre a área logada', () => {
    // Documento de formato válido que não corresponde à conta de teste. É
    // deliberado não usar senha errada na conta real: rodando a cada push, o
    // teste acumularia tentativas falhas e poderia bloquear o acesso de todo
    // mundo ao ambiente.
    cy.visit('/login');
    cy.get(loginElements.botaoLoginDocumento).should('be.visible').click();
    cy.get(loginElements.campoLoginCPFCNPJ).clear().type(DOCUMENTO_INEXISTENTE);
    cy.get(loginElements.campoNumeroConta).clear().type('99999');
    cy.get(loginElements.campoSenha).clear().type('senha-invalida', { log: false });
    cy.get(loginElements.botaoEntrar).should('be.enabled').click();

    // O critério é não autenticar: continua no /login e nenhuma tela interna
    // aparece. Vale mais que assertar texto de erro, que hoje nem existe.
    cy.shouldBeOnPath('/login');
    cy.get(homeElements.botaoMenuHome).should('not.exist');
  });

  it.skip('deveria avisar que as credenciais são inválidas — DEFEITO conhecido', () => {
    // Medido: 16 amostras da tela a cada 500ms, durante 8s após o clique em
    // Entrar. Nenhum toast, nenhum [role="alert"], nenhuma mensagem no campo.
    // Quem erra a senha não recebe retorno algum.
    cy.visit('/login');
    cy.get(loginElements.botaoLoginDocumento).click();
    cy.get(loginElements.campoLoginCPFCNPJ).clear().type(DOCUMENTO_INEXISTENTE);
    cy.get(loginElements.campoNumeroConta).clear().type('99999');
    cy.get(loginElements.campoSenha).clear().type('senha-invalida', { log: false });
    cy.get(loginElements.botaoEntrar).click();

    cy.contains(/inválid|incorret|não encontrad/i).should('be.visible');
  });
});
