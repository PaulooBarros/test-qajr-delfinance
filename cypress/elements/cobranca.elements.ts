export const cobrancaElements = {
  cardCobrar: 'Crie QR Code ou copia e cola',

  tituloSelecaoDeChave: 'Selecione a chave pela qual você deseja cobrar',
  /** A chave é escolhida pelo tipo, nunca pelo valor, que identifica a conta. */
  textoChaveAleatoria: 'Chave aleatória',

  rotuloValor: 'Valor (R$)',
  radioQrCode: 'input[value="qrCode"]',
  radioCopiaECola: 'input[value="copyPaste"]',
  botaoGerar: 'Gerar Cobrança',

  rotaGeracao: '**/qr-code*',
  /** Todo BR Code (padrão EMV) começa assim. */
  prefixoBrCode: '00020',
} as const;

export default cobrancaElements;
