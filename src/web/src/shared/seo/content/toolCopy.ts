import type { FaqItem } from './faqShared'
import { SHARED_FAQ } from './faqShared'

const TOOL_FAQ_OVERRIDES: Record<string, FaqItem[]> = {
  'json-formatter': [
    {
      question: 'Como formatar JSON online?',
      answer:
        'Cole o JSON no editor e use Ctrl+Shift+F para formatar ou Ctrl+Shift+M para compactar. Tudo acontece localmente no navegador.',
    },
    {
      question: 'Qual a diferença entre formatar e compactar?',
      answer:
        'Formatar adiciona indentação legível; compactar remove espaços e quebras de linha para reduzir o tamanho do arquivo.',
    },
  ],
  jsonpath: [
    {
      question: 'O que é JSONPath?',
      answer:
        'JSONPath é uma linguagem de consulta para extrair valores de documentos JSON, semelhante ao XPath para XML.',
    },
    {
      question: 'JSONPath funciona offline?',
      answer: 'Sim. A consulta roda inteiramente no seu navegador, sem enviar o JSON a servidores.',
    },
  ],
  jmespath: [
    {
      question: 'O que é JMESPath?',
      answer:
        'JMESPath é uma linguagem de consulta para JSON usada em AWS e outras plataformas para filtrar e projetar dados.',
    },
  ],
  'json-schema': [
    {
      question: 'Qual versão de JSON Schema é gerada?',
      answer: 'O gerador produz JSON Schema Draft 2020-12 a partir de um sample JSON.',
    },
  ],
  'json-to-typescript': [
    {
      question: 'Como gerar interfaces TypeScript a partir de JSON?',
      answer:
        'Cole um sample JSON, selecione TypeScript no gerador de código e clique em Gerar. Copie o resultado para o seu projeto.',
    },
  ],
  'http-client': [
    {
      question: 'A requisição HTTP passa pelo servidor do JSON Mais?',
      answer:
        'Não. O cliente HTTP roda no seu navegador e envia a requisição diretamente ao endpoint que você informar.',
    },
  ],
}

export function getToolFaq(slug: string, h1: string, description: string): FaqItem[] {
  const specific = TOOL_FAQ_OVERRIDES[slug] ?? [
    {
      question: `Como usar ${h1}?`,
      answer: description,
    },
    {
      question: `${h1} é seguro para dados sensíveis?`,
      answer:
        'O processamento é local-first: o JSON não sai do navegador. Mesmo assim, evite colar segredos em máquinas compartilhadas.',
    },
  ]
  return [...specific, ...SHARED_FAQ]
}
