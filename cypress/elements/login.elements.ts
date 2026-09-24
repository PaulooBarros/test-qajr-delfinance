export const loginElements = {
  abaLoginDocumento: '[data-testid="tab-login-document"]',
  campoLoginCPFCNPJ: '[data-testid="standard-login-document-input"]',
  campoNumeroConta: '[data-testid="standard-login-account-input"]',
  campoSenha: '[data-testid="standard-login-password-input"]',
  botaoEntrar: '[data-testid="standard-login-submit-button"]',
} as const;

export default loginElements;
