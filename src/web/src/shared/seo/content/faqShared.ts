export type FaqItem = { question: string; answer: string }

/** Respostas comuns a todas as ferramentas JSON (privacidade / dispositivo). */
export const SHARED_FAQ: FaqItem[] = [
  {
    question: 'A ferramenta funciona no celular?',
    answer:
      'Sim. O JSON Mais roda no navegador (Chrome, Safari, Edge e similares). Em telas menores o editor completo fica mais confortável em modo paisagem ou em desktop.',
  },
  {
    question: 'Preciso instalar algum programa?',
    answer:
      'Não. Não há instalação nem cadastro. Basta abrir a ferramenta no site, colar ou carregar o JSON e usar no navegador.',
  },
  {
    question: 'Meu JSON é enviado para um servidor?',
    answer:
      'Não. Parse, format, compare, query, convert e codegen rodam só no seu dispositivo. O portal é uma SPA estática — o documento JSON nunca sai do navegador.',
  },
  {
    question: 'É gratuito?',
    answer:
      'Sim. As ferramentas do JSON Mais podem ser usadas gratuitamente, sem criar conta. Anúncios só aparecem após o consentimento de cookies de marketing.',
  },
]
