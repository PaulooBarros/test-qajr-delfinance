/**
 * Seletores da tela de Extrato (/contas/extrato).
 *
 * A tela em si não tem data-testid — só o item de menu que leva até ela. Vale
 * a mesma política do Pix: ARIA primeiro, texto visível depois, classe de
 * framework por último.
 */
export const extratoElements = {
  /** Rótulos dos campos de período. O input é alcançado pelo label. */
  labelDataInicial: 'A partir de',
  labelDataFinal: 'Até',

  /** Combo de tipo de lançamento. */
  labelFiltrarPor: 'Filtrar por',

  botaoFiltrar: 'Filtrar',
  botaoLimpar: 'Limpar',
  botaoExportar: 'Exportar Extrato',
  botaoRelatorioSumarizado: 'Relatório Sumarizado',

  /**
   * Texto do carregamento da tabela. Está em inglês no meio de um produto em
   * português — é defeito de i18n (ver README, seção Defeitos), mas serve como sinal de
   * sincronismo: esperar ele sumir é o que garante dados na tela.
   */
  carregando: 'Loading items...',

  /** Estado vazio e contador, que precisam ser coerentes entre si. */
  mensagemSemLancamentos: 'Não existem lançamentos para serem mostrados.',

  /**
   * O rodapé tem dois formatos: "Mostrando 0 lançamentos" quando vazio e
   * "Mostrando 3 de 3 lançamentos" quando há registros (exibidos de total).
   * O grupo capturado é sempre o **total**, que é o número que interessa.
   */
  contador: /Mostrando (?:\d+ de )?(\d+) lançamentos?/,

  /** Linhas de dados da tabela. */
  linhas: 'tbody tr',

  /** Colunas esperadas, na ordem em que o produto as exibe. */
  colunas: ['Tipo', 'Data', 'Identificador', 'Valor', 'Ações'],
} as const;

export default extratoElements;
