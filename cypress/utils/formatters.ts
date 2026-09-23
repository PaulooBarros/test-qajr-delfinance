/** Remove tudo que não for dígito: "300.300.300-30" -> "30030030030" */
export const apenasDigitos = (valor: string): string => valor.replace(/\D/g, '');

/** Date -> "30/09/2026", formato exibido no campo de data da transferência. */
export const paraDataBR = (data: Date): string =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(data);

/**
 * Date -> "30 de setembro de 2026".
 *
 * É o trecho estável do aria-label do dia no calendário. O rótulo completo
 * inclui o dia da semana ("quarta-feira, 30 de setembro de 2026"), que é
 * derivável da data e só adicionaria uma forma de o seletor quebrar — por
 * isso a busca usa este pedaço, com casamento parcial.
 */
export const paraDiaPorExtenso = (data: Date): string =>
  new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(data);

/**
 * Centavos digitados -> valor formatado pela máscara: '1' -> "0,01".
 *
 * Devolve só o número, sem "R$": o símbolo vem separado por espaço
 * não-quebrável em alguns ambientes, e comparar isso quebraria o teste por
 * motivo que não tem nada a ver com o produto.
 */
export const centavosParaValorBR = (centavos: string): string =>
  (Number(apenasDigitos(centavos)) / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
  });

/** Primeiro dia do mês da data informada — o padrão do filtro de extrato. */
export const primeiroDiaDoMes = (data: Date): Date =>
  new Date(data.getFullYear(), data.getMonth(), 1);

/**
 * "23/09/2026" -> Date, para comparar datas lidas da tela.
 *
 * Extrai a data de dentro do texto em vez de exigir a string limpa: no
 * extrato, a célula traz data e hora coladas ("23/09/202616:51:05"), e um
 * split simples devolveria NaN.
 */
export const deDataBR = (texto: string): Date => {
  const encontrado = texto.match(/(\d{2})\/(\d{2})\/(\d{4})/);

  if (!encontrado) {
    throw new Error(`Não encontrei data no formato dd/mm/aaaa em "${texto}"`);
  }

  const [, dia, mes, ano] = encontrado.map(Number);

  return new Date(ano, mes - 1, dia);
};
