/**
 * Seletores da cobrança Pix (/contas/pix/cobranca).
 *
 * Sem data-testid, como o resto do fluxo de Pix. A âncora mais forte aqui é o
 * `value` dos rádios de tipo — atributo funcional, que o front precisa manter
 * para o próprio formulário funcionar.
 */
export const cobrancaElements = {
  /** Card de entrada, na tela /contas/pix. */
  cardCobrar: 'Crie QR Code ou copia e cola',

  /** Etapa 1: escolha da chave que vai receber. */
  tituloSelecaoDeChave: 'Selecione a chave pela qual você deseja cobrar',

  /**
   * A chave é escolhida pelo **tipo**, nunca pelo valor: o valor identifica a
   * conta e não pode entrar no repositório.
   */
  chaveAleatoria: 'Chave aleatória',

  /** Etapa 2: formulário da cobrança. */
  labelValor: 'Valor (R$)',
  tipoQrCode: 'input[value="qrCode"]',
  tipoCopiaECola: 'input[value="copyPaste"]',
  botaoGerar: 'Gerar Cobrança',

  /** Endpoint que gera o BR Code e a imagem do QR. */
  rotaGeracao: '**/qr-code*',

  /** Todo BR Code do padrão EMV começa com este identificador. */
  prefixoBrCode: '00020',
} as const;

export default cobrancaElements;
