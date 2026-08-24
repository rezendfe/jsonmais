import { Link } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import {
  endClientSession,
  ensureClientSession,
  maskSessionId,
} from '../../shared/session/clientSession'
import { clearWorkspaceFromLocalStorage } from '../../shared/json/store'
import styles from './TrustPages.module.css'

const FAQ = [
  {
    q: 'Preciso instalar alguma coisa?',
    a: 'Não. O JSON Mais roda no navegador. Abra a página, cole ou carregue um arquivo e edite.',
  },
  {
    q: 'Meu JSON sobe para o servidor?',
    a: 'Não. Parse, format, compare, query, convert e codegen acontecem só no seu device — nada é enviado a servidores.',
  },
  {
    q: 'Preciso criar conta?',
    a: 'Não. Não há cadastro. O último workspace pode ficar em localStorage neste dispositivo.',
  },
  {
    q: 'O que o editor dual-panel faz?',
    a: 'Dois painéis com modos texto, árvore e tabela. O trilho do meio copia, transforma e compara a estrutura.',
  },
  {
    q: 'Funciona no celular?',
    a: 'Sim. O shell e as ferramentas são responsivos; o workspace completo fica mais confortável em telas largas.',
  },
]

export function AboutPage() {
  return (
    <article className={styles.page}>
      <p className={styles.brandSignal}>JSON Mais</p>
      <h1>Sobre o produto</h1>
      <p className={styles.lead}>
        Editor JSON online e developer toolbox da Soluções Simples — local-first, sem cadastro.
      </p>
      <p>
        Você formata, inspeciona em árvore ou tabela, transforma, valida schema e compara documentos
        no navegador. Tudo roda localmente — o conteúdo do editor nunca sai do seu device.
      </p>
      <p>
        Inspirado nas capacidades livres de{' '}
        <a href="https://jsoneditoronline.org/" rel="noopener noreferrer" target="_blank">
          JSON Editor Online
        </a>
        , com hub de ferramentas no espírito de portais como{' '}
        <a href="https://123tools.to/" rel="noopener noreferrer" target="_blank">
          123tools
        </a>
        .
      </p>
      <Link className={styles.cta} to="/">
        Abrir editor
      </Link>
    </article>
  )
}

export function HowItWorksPage() {
  return (
    <article className={styles.page}>
      <p className={styles.brandSignal}>JSON Mais</p>
      <h1>Como funciona</h1>
      <p className={styles.lead}>Três passos, do zero ao resultado — tudo no browser.</p>

      <ol className={styles.steps}>
        <li>
          <span className={styles.stepNum}>1</span>
          <div>
            <h2>Abra ou cole o JSON</h2>
            <p>
              No <Link to="/">editor</Link>, use abrir/salvar, colar ou arrastar. Nada é enviado a
              servidores.
            </p>
          </div>
        </li>
        <li>
          <span className={styles.stepNum}>2</span>
          <div>
            <h2>Edite nos dois painéis</h2>
            <p>
              Texto, árvore ou tabela; trilho do meio para copiar, transformar e comparar. Format e
              compact ficam nos menus de cada painel.
            </p>
          </div>
        </li>
        <li>
          <span className={styles.stepNum}>3</span>
          <div>
            <h2>Use o toolbox</h2>
            <p>
              Analise, consulte (JSONPath/JMESPath), converta ou gere código. Envie o resultado de
              volta ao painel — ou abra uma{' '}
              <Link to="/ferramentas">ferramenta dedicada</Link>.
            </p>
          </div>
        </li>
      </ol>

      <section className={styles.faq} aria-labelledby="faq-title">
        <h2 id="faq-title">Perguntas frequentes</h2>
        {FAQ.map((item) => (
          <details key={item.q} className={styles.faqItem}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>

      <div className={styles.ctaBand}>
        <h2>Pronto para editar</h2>
        <p>Sem instalação. Sem conta. Só o browser.</p>
        <Link className={styles.cta} to="/">
          Abrir editor
        </Link>
      </div>
    </article>
  )
}

export function PrivacyPage() {
  const [clientId, setClientId] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState<'session' | 'local' | null>(null)

  useEffect(() => {
    const info = ensureClientSession(window.localStorage)
    setClientId(info.clientId)
  }, [])

  const onEndSession = useCallback(() => {
    setBusy('session')
    setActionMessage(null)
    endClientSession(window.localStorage)
    setClientId(null)
    setBusy(null)
    setActionMessage(
      'Identificador anônimo removido deste dispositivo. Um novo será criado na próxima visita.',
    )
  }, [])

  const onClearLocal = useCallback(() => {
    setBusy('local')
    setActionMessage(null)
    clearWorkspaceFromLocalStorage(window.localStorage)
    setBusy(null)
    setActionMessage('Workspace local removido deste dispositivo. Recarregue o editor para ver o exemplo padrão.')
  }, [])

  return (
    <article className={styles.page}>
      <p className={styles.brandSignal}>JSON Mais</p>
      <h1>Privacidade</h1>
      <p className={styles.lead}>
        O documento JSON não sai do seu navegador.
      </p>
      <p>
        Parse, format, compare, query, convert e codegen rodam só no seu device. Não há servidor de
        aplicação — o portal é uma SPA estática.
      </p>

      <section className={styles.privacyPanel} aria-labelledby="privacy-data-title">
        <h2 id="privacy-data-title">O que fica onde</h2>
        <dl className={styles.privacyList}>
          <div>
            <dt>Documento JSON</dt>
            <dd>Só na memória do browser e, se você editar, em localStorage neste device.</dd>
          </div>
          <div>
            <dt>ID anônimo local (`jsonmais_client_id`)</dt>
            <dd>UUID em localStorage neste device. Não contém JSON nem dados pessoais.</dd>
          </div>
          <div>
            <dt>Identificador atual</dt>
            <dd>
              {clientId ? (
                <code className={styles.sessionCode}>{maskSessionId(clientId)}</code>
              ) : (
                'Nenhum (encerrado neste device)'
              )}
            </dd>
          </div>
        </dl>

        <div className={styles.privacyActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            disabled={busy !== null}
            onClick={onEndSession}
          >
            {busy === 'session' ? 'Encerrando…' : 'Encerrar sessão anônima'}
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            disabled={busy !== null}
            onClick={onClearLocal}
          >
            {busy === 'local' ? 'Limpando…' : 'Limpar workspace local'}
          </button>
        </div>

        {actionMessage ? (
          <p className={styles.actionMessage} role="status">
            {actionMessage}
          </p>
        ) : null}
      </section>

      <p>
        Cookies de marketing, se existirem no futuro, só após consentimento (spec de cookies/ads).
      </p>
      <Link className={styles.cta} to="/">
        Voltar ao editor
      </Link>
    </article>
  )
}
