import { comumElements } from './comum.elements';

/**
 * Tela de Pix, na ordem do fluxo. Não tem nenhum data-testid, então os
 * seletores seguem a política do README: ARIA, depois texto visível, depois classe.
 */
export const pixElements = {
  modal: comumElements.modal,

  // Etapa 1: chave
  cardTransferir: 'Por chave, dados bancários ou QR Code',
  tituloEtapaChave: 'Insira a chave Pix',
  /** Só para achar o input: o Vuetify esconde o label quando o campo tem conteúdo. */
  rotuloChave: 'Digite a chave Pix',
  mensagemChaveInexistente: 'Não foi encontrado uma conta vinculada a esta chave',

  // Etapa 2: valor e descrição
  tituloNovaTransferencia: 'Nova Transferência Pix',
  campoValor: 'input[placeholder="R$ 0,00"]',
  campoDescricao: 'input[placeholder="Descrição da transferência (opcional)"]',

  // Etapa 3: data (inputmode="none": só muda pelo calendário)
  campoData: 'input[placeholder="dd/mm/yyyy"]',

  // Etapa 4: PIN
  tituloConfirmarPagamento: 'Confirmar Pagamento',
  campoCodigo: comumElements.campoCodigo,

  // Etapa 5: resultado
  /** Mesmo texto no agendamento: não distingue imediato de agendado. */
  toastSucesso: 'Transferência Pix efetuada com sucesso',
  /** Regex: o rótulo vem com nbsp por causa do ícone. */
  botaoComprovante: /Exportar\s+Comprovante/i,
  iconeDownload: '.mdi-download',

  botaoContinuar: 'Continuar',
  botaoConfirmar: 'Confirmar',
} as const;

export default pixElements;
