/**
 * Seletores do menu lateral, compartilhados por várias telas.
 *
 * Diferente do fluxo de Pix, o menu **expõe data-testid**. São as âncoras
 * mais estáveis do projeto: não dependem de texto, de posição na lista nem de
 * classe de framework. Usar sempre estas para navegar.
 */
export const menuElements = {
  menu: '[data-testid="sidebar-menu"]',
  itemHome: '[data-testid="sidebar-item-home"]',
  itemExtrato: '[data-testid="sidebar-item-extrato"]',
  itemPix: '[data-testid="sidebar-item-pix"]',
  /** TED e Entre contas são filhos deste grupo, que nasce recolhido. */
  grupoTransferencias: '[data-testid="sidebar-group-transferencias"]',
  itemTed: '[data-testid="sidebar-item-ted"]',
  itemAgendamentos: '[data-testid="sidebar-item-agendamentos"]',
  itemLimites: '[data-testid="sidebar-item-limites"]',

  /**
   * Logout. Único item do menu sem data-testid — vai por texto até o front
   * adicionar o atributo, como fez com os demais.
   */
  botaoSair: 'Sair',
} as const;

export default menuElements;
