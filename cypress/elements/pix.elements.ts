import { comumElements } from './comum.elements';

/**
 * Seletores da tela de Pix, na ordem em que aparecem no fluxo.
 *
 * Esta é a tela sem nenhum data-testid, então cada âncora segue a política de
 * seletores do README ("Política de seletores"): ARIA primeiro, texto visível
 * depois, classe de framework por último — e nada que o Vue regere sozinho.
 */
export const pixElements = {
  // --- Estrutura compartilhada por todas as etapas -------------------------

  /**
   * Modal de qualquer etapa. O Vuetify empilha os overlays e mantém a etapa
   * anterior no DOM, então quase toda busca precisa ser escopada no de cima.
   */
  modal: comumElements.modal,

  // --- Etapa 1: entrada e chave do favorecido ------------------------------

  /** Card de entrada do fluxo, na tela /contas/pix. */
  cardTransferir: 'Por chave, dados bancários ou QR Code',

  /** Título da etapa da chave — continua visível com o campo preenchido. */
  tituloEtapaChave: 'Insira a chave Pix',

  /**
   * Texto do <label> do campo de chave. Serve para achar o input, mas não
   * para assertar que a etapa está na tela: o Vuetify aplica
   * visibility:hidden no label assim que o campo tem conteúdo.
   */
  labelChave: 'Digite a chave Pix',

  // --- Etapa 2: valor e descrição ------------------------------------------

  /** Título do modal que abre depois da chave validada no DICT. */
  tituloNovaTransferencia: 'Nova Transferência Pix',

  /** Campos do modal: aqui o texto está no placeholder, não em label. */
  campoValor: 'input[placeholder="R$ 0,00"]',
  campoDescricao: 'input[placeholder="Descrição da transferência (opcional)"]',

  // --- Etapa 3: data da transferência --------------------------------------

  /**
   * Campo de data. Tem inputmode="none": o teclado não entra, a data só muda
   * pelo calendário. O dia dentro do calendário é achado pelo aria-label,
   * montado em paraDiaPorExtenso().
   */
  campoData: 'input[placeholder="dd/mm/yyyy"]',

  // --- Etapa 4: confirmação por PIN ----------------------------------------

  /** Título do modal de PIN. */
  tituloConfirmarPagamento: 'Confirmar Pagamento',

  /**
   * Os 6 inputs de um dígito. O seletor é o autocomplete padrão de código de
   * uso único — atributo de HTML, mais estável que a classe .otp-input, que é
   * nome interno e some num refactor de CSS.
   */
  campoCodigo: comumElements.campoCodigo,

  // --- Etapa 5: resultado ---------------------------------------------------

  /**
   * Toast de sucesso: vive poucos segundos, assertar logo após o confirm.
   *
   * O produto usa este mesmo texto no agendamento — diz "efetuada" mesmo
   * quando a transferência foi marcada para outro dia. Por isso o toast não
   * distingue os dois cenários, e o teste de agendamento asserta a data no
   * campo antes de confirmar.
   */
  toastSucesso: 'Transferência Pix efetuada com sucesso',

  /**
   * Botão de download do comprovante. Regex e não string: o rótulo vem
   * cercado de espaços por causa do ícone, e \s cobre também o nbsp, que
   * comparação por texto exato não casa.
   */
  botaoComprovante: /Exportar\s+Comprovante/i,

  /** Ícone dentro desse botão — confirma que é o de download. */
  iconeDownload: '.mdi-download',

  // --- Botões, presentes em mais de uma etapa -------------------------------

  /** Nascem desabilitados até o campo da etapa validar. */
  botaoContinuar: 'Continuar',
  botaoConfirmar: 'Confirmar',
  botaoVoltar: 'Voltar',
  botaoCancelar: 'Cancelar',

  // --- Mensagens esperadas --------------------------------------------------

  /**
   * Aviso que o produto **deveria** dar para chave inexistente e hoje não dá
   * (ver README, seção Defeitos). Usado pelo teste em .skip que registra a expectativa.
   */
  mensagemChaveInexistente: /chave não encontrada|chave inválida|não localizada/i,
} as const;

export default pixElements;
