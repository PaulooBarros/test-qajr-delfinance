/** Seletores da tela Home (dashboard pós-login). */
export const homeElements = {
  botaoMenuHome: '[data-testid="sidebar-item-home"]',

  /** Card de saldo. */
  tituloSaldo: 'Saldo em conta',
  rotuloDisponivel: 'Disponível',

  /**
   * Alternador de visibilidade do saldo. O aria-label é a âncora: descreve a
   * ação para leitor de tela, então o front não pode removê-lo sem quebrar
   * acessibilidade junto.
   */
  botaoMostrarSaldo: 'button[aria-label="Mostrar saldo"]',

  /** Máscara exibida enquanto o saldo está oculto. */
  saldoOculto: '••••••',

  /** Formato do saldo revelado: R$ seguido de valor com centavos. */
  formatoDeSaldo: /R\$\s?[\d.]+,\d{2}/,
} as const;

export default homeElements;
