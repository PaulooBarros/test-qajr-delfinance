export const extratoElements = {
  rotuloDataInicial: 'A partir de',
  rotuloDataFinal: 'Até',

  botaoFiltrar: 'Filtrar',
  botaoLimpar: 'Limpar',

  textoCarregando: 'Loading items...',

  mensagemSemLancamentos: 'Não existem lançamentos para serem mostrados.',

  /** "Mostrando 0 lançamentos" ou "Mostrando 3 de 3 lançamentos"; o grupo é o total. */
  textoContador: /Mostrando (?:\d+ de )?(\d+) lançamentos?/,

  linhasDaTabela: 'tbody tr',
  colunasDaTabela: ['Tipo', 'Data', 'Identificador', 'Valor', 'Ações'],
} as const;

export default extratoElements;
