/**
 * Proxies Ads API Soluções Simples. Secrets only from SWA app settings.
 * Soft-fail → 204 (SPA omits empty ad slots).
 */
module.exports = async function (context, req) {
  const enabled = String(process.env.ADS_ENABLED || '').toLowerCase()
  const baseUrl = (process.env.ADS_BASE_URL || '').replace(/\/$/, '')
  const sistemaKey = process.env.ADS_SISTEMA_KEY || ''

  if (!(enabled === '1' || enabled === 'true') || !baseUrl || !sistemaKey) {
    context.res = { status: 204 }
    return
  }

  try {
    const upstream = await fetch(`${baseUrl}/v1/public/creative?format=json`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-Sistema-Key': sistemaKey,
      },
    })

    if (!upstream.ok) {
      context.res = { status: 204 }
      return
    }

    const body = await upstream.json()
    if (!body?.advertisementId || !body?.html || !body?.clickUrl) {
      context.res = { status: 204 }
      return
    }

    context.res = {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
      body: {
        advertisementId: body.advertisementId,
        categoryId: body.categoryId ?? null,
        html: body.html,
        clickUrl: body.clickUrl,
      },
    }
  } catch (err) {
    context.log.warn('Ads creative proxy soft-failed', err)
    context.res = { status: 204 }
  }
}
