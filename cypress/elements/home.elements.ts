export const homeElements = {
  itemMenuHome: '[data-testid="sidebar-item-home"]',

  tituloSaldo: 'Saldo em conta',
  rotuloDisponivel: 'Disponível',
  botaoMostrarSaldo: 'button[aria-label="Mostrar saldo"]',
  textoSaldoOculto: '••••••',
  formatoDeSaldo: /R\$\s?[\d.]+,\d{2}/,
} as const;

export default homeElements;
