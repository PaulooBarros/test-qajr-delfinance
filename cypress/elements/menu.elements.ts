export const menuElements = {
  menuLateral: '[data-testid="sidebar-menu"]',
  itemExtrato: '[data-testid="sidebar-item-extrato"]',
  itemAgendamentos: '[data-testid="sidebar-item-agendamentos"]',

  /** Único item sem data-testid. */
  botaoSair: 'Sair',
} as const;

export default menuElements;
