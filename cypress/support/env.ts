/**
 * Leitura de variáveis do cypress.env.json com falha explícita.
 *
 * Cypress.env('naoExiste') devolve undefined em silêncio. O teste segue, e o
 * erro só aparece comandos depois — disfarçado de "seletor não encontrado" ou
 * de chave inválida na tela. Quem for rodar a suíte pela primeira vez perde
 * tempo caçando um bug que é, na verdade, credencial ausente.
 *
 * Fica em support/ e não em utils/ porque depende do objeto global Cypress:
 * utils/ é reservado a função pura, testável fora do navegador.
 */
export const envObrigatoria = (nome: string): string => {
  const valor = Cypress.env(nome);

  if (valor === undefined || valor === null || String(valor).trim() === '') {
    // Listar as chaves que o Cypress enxergou — só os nomes, nunca os
    // valores — separa dois problemas que hoje dão a mesma mensagem:
    //
    // - lista vazia: o cypress.env.json não está sendo lido. Arquivo em
    //   outra pasta, nome errado (cypress.env.json.txt é clássico no Windows
    //   com extensões ocultas) ou comando rodado fora da raiz do projeto;
    // - lista com outras chaves: o arquivo foi lido e o nome da variável é
    //   que está diferente.
    const todas = Cypress.env() as Record<string, unknown>;
    const comValor = Object.keys(todas).filter((chave) => String(todas[chave] ?? '').trim());
    const encontradas = comValor.length
      ? comValor.join(', ')
      : '(nenhuma — o cypress.env.json não foi lido)';

    throw new Error(
      [
        `Variável de ambiente "${nome}" não encontrada.`,
        `  - Chaves que o Cypress enxergou: ${encontradas}`,
        '  - Local: cypress.env.json precisa estar na raiz do projeto, ao lado',
        '    de cypress.config.ts, e o comando precisa rodar dessa mesma pasta.',
        `  - CI: configure o secret e mapeie para CYPRESS_${nome} no workflow.`,
      ].join('\n'),
    );
  }

  return String(valor);
};
