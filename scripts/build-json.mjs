import fs from 'node:fs/promises'
import path from 'node:path'

const OUTPUT_DIR = path.resolve(process.cwd(), 'public')

const SOURCE_URLS = {
  products:
    process.env.PRODUCTS_CSV_URL ||
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vQBtV8q3Ank7Bnhs83IbOb97U46juV-RKeL3NpdFiNcSu-ifI21fQYo1-io62S3JIrXEO5MiDArc1Lr/pub?gid=1623055155&single=true&output=csv',
  pitch:
    process.env.PITCH_CSV_URL ||
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vQJaiIUkmBPfRcFADAoW4-_zbWB78gZb1yR_2gM9oORqRwCx8vb844cP-KcE58FgTVynptYk6L6o9pm/pub?gid=0&single=true&output=csv',
  promotions:
    process.env.PROMOTIONS_CSV_URL ||
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vT3hvcNJNEfLugUcwQdHTTu0NZcy2QHyMPvMaPpfU6g_p0MTrw3muXIGn3SPkISSPnbW9ou1GlHzRc6/pub?gid=74407584&single=true&output=csv',
  rank:
    process.env.RANKINGS_CSV_URL ||
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vQj5QLrtaWikGcLNwMawbjiN8ZQDgFzW1RV7UECFgLzECWj16I2ugE_B6tzzLICCynsk1L6lAuJfccS/pub?gid=93142219&single=true&output=csv',
}

const nowIso = new Date().toISOString()
const buildId = nowIso.replace(/[-:TZ.]/g, '').slice(0, 14)

function normalizeKey(value) {
  return String(value || '')
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_\-／/（）()\[\]【】「」『』:：]+/g, '')
}

function parseCsvMatrix(text) {
  const rows = []
  let row = []
  let cell = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    const next = text[i + 1]

    if (ch === '"') {
      if (inQuotes && next === '"') {
        cell += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (ch === ',' && !inQuotes) {
      row.push(cell)
      cell = ''
      continue
    }

    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i += 1
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
      continue
    }

    cell += ch
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }

  return rows
    .map((r) => r.map((v) => String(v ?? '').replace(/^\uFEFF/, '').trim()))
    .filter((r) => r.some((v) => v !== ''))
}

function matrixToObjects(matrix, headerRowIndex = 0) {
  if (!matrix.length || !matrix[headerRowIndex]) return []
  const headers = matrix[headerRowIndex].map((h) => String(h || '').replace(/^\uFEFF/, '').trim())
  return matrix
    .slice(headerRowIndex + 1)
    .filter((r) => r.some((v) => String(v || '').trim() !== ''))
    .map((r) => {
      const obj = {}
      headers.forEach((header, idx) => {
        obj[header] = String(r[idx] ?? '').trim()
      })
      return obj
    })
}

function buildValueGetter(row) {
  const entries = Object.entries(row || {})
  const normalized = new Map(entries.map(([key, value]) => [normalizeKey(key), value]))

  const getExact = (...candidates) => {
    for (const candidate of candidates.flat()) {
      const value = normalized.get(normalizeKey(candidate))
      if (value !== undefined && String(value).trim() !== '') return String(value).trim()
    }
    return ''
  }

  const getRegex = (...patterns) => {
    for (const [key, value] of normalized.entries()) {
      if (!String(value || '').trim()) continue
      if (patterns.some((p) => p.test(key))) return String(value).trim()
    }
    return ''
  }

  return { getExact, getRegex }
}

function toNumber(value) {
  const cleaned = String(value || '').replace(/[\s,NT$元]/gi, '')
  if (!cleaned) return 0
  const num = Number(cleaned)
  return Number.isFinite(num) ? num : 0
}

function toBool(value) {
  const raw = String(value || '').trim().toLowerCase()
  return ['1', 'true', 'yes', 'y', '是', '有', '上架', 'active', 'x', 'v', '✓'].includes(raw)
}

function splitList(value) {
  return String(value || '')
    .split(/[\n\r,，;；、|]+/)
    .map((v) => v.trim())
    .filter(Boolean)
}

function normalizeDateString(value) {
  return String(value || '').trim().replace(/[.]/g, '/').replace(/-/g, '/')
}

function parseLooseDate(value) {
  const raw = normalizeDateString(value)
  if (!raw) return null
  const match = raw.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/)
  if (!match) return null
  const [, y, m, d] = match
  const dt = new Date(Number(y), Number(m) - 1, Number(d))
  return Number.isNaN(dt.getTime()) ? null : dt
}

function inferPromoStatus(explicitStatus, startDate, endDate) {
  const raw = String(explicitStatus || '').trim().toLowerCase()
  if (['active', '進行中', 'on', 'ongoing'].includes(raw)) return 'active'
  if (['upcoming', '即將開始', 'coming', 'soon'].includes(raw)) return 'upcoming'
  if (['ended', '已結束', 'off', 'expired'].includes(raw)) return 'ended'

  const now = new Date()
  const start = parseLooseDate(startDate)
  const end = parseLooseDate(endDate)

  if (start && start > now) return 'upcoming'
  if (end && end < now) return 'ended'
  return 'active'
}

function channelFlagsFromRow(getExact) {
  const show = toBool(getExact('channel_showroom', 'showroom', 'show', '展售中心', '通路展售中心'))
  const mart = toBool(getExact('channel_mart', 'mart', '便利店', '通路便利店'))
  const eshop = toBool(getExact('channel_eshop', 'eshop', '購物網', '通路購物網'))
  const office = toBool(getExact('channel_office', 'office', '營業所', '通路營業所'))
  return { show, mart, eshop, office }
}

function channelLabelsFromFlags(ch) {
  const labels = []
  if (ch.show) labels.push('展售中心')
  if (ch.mart) labels.push('便利店')
  if (ch.eshop) labels.push('購物網')
  if (ch.office) labels.push('營業所')
  return labels
}

function looksLikeHtml(text) {
  const s = String(text || '').trim().slice(0, 500).toLowerCase()
  return s.startsWith('<!doctype html') || s.startsWith('<html') || s.includes('<head>') || s.includes('<body')
}

async function fetchText(url, label) {
  const res = await fetch(url, {
    headers: {
      'cache-control': 'no-cache',
      pragma: 'no-cache',
    },
  })

  if (!res.ok) throw new Error(`${label} CSV 下載失敗：${res.status} ${res.statusText}`)

  const text = await res.text()
  if (looksLikeHtml(text)) {
    throw new Error(`${label} 不是 CSV，而是 HTML 頁面。通常代表網址錯了、試算表未發布、或權限未開放。`)
  }
  return text
}

async function fetchCsvRows(url, label) {
  const text = await fetchText(url, label)
  const matrix = parseCsvMatrix(text)
  const rows = matrixToObjects(matrix, 0)
  const headers = matrix[0] || []
  console.log(`📄 ${label} rows=${rows.length} headers=${headers.join(' | ')}`)
  return rows
}

async function fetchCsvMatrix(url, label) {
  const text = await fetchText(url, label)
  const matrix = parseCsvMatrix(text)
  const sampleHeaders = matrix.slice(0, 4).map((row) => row.join(' | ')).join(' || ')
  console.log(`📄 ${label} matrixRows=${matrix.length} topRows=${sampleHeaders}`)
  return matrix
}

function readProductFields(row) {
  const { getExact, getRegex } = buildValueGetter(row)
  const code =
    getExact('code', 'product_code', '商品編號', '商品代號', 'item_code', '品號') ||
    getRegex(/(^|.*)(product)?code$/, /商品(編號|代號)/, /品號/, /料號/, /sku/, /貨號/)
  const name =
    getExact('name', 'product_name', '商品名稱', '品名') ||
    getRegex(/(^|.*)name$/, /商品名稱/, /品名/, /名稱/)

  const isHiddenPPRaw =
    getExact('is_hidden_pp', 'is hidden pp', '隱藏pp', '隱藏_pp', 'pp_hidden', 'hidden_pp') ||
    getRegex(/ishiddenpp/, /hiddenpp/, /pphidden/, /隱藏pp/)

  const isHiddenRaw =
    getExact('is_hidden', 'is hidden', '隱藏', 'hidden') ||
    getRegex(/ishidden$/, /^hidden$/, /商品隱藏/, /隱藏/)

  return {
    code,
    name,
    category:
      getExact('category', '分類', 'category_name', '大類別', '商品分類') ||
      getRegex(/category/, /分類/, /大類別/),
    price:
      getExact('price', 'list_price', '售價', 'price_twd', '單價', '建議售價') ||
      getRegex(/price/, /售價/, /單價/),
    spec: getExact('spec', 'spec_1', '規格', '容量規格') || getRegex(/spec/, /規格/),
    photo:
      getExact('photo', 'photos url', 'image', 'image_url', 'img', '圖片', '商品圖片') ||
      getRegex(/image/, /img/, /圖片/, /photos?url/),
    videoUrl:
      getExact('videoUrl', 'video_url', '影片連結', '影音連結') ||
      getRegex(/video/, /影片/, /影音/),
    moreLinksRaw:
      getExact('moreLinksRaw', 'more_links', '更多素材', 'more_links_raw') ||
      getRegex(/morelinks?/, /素材/),
    isHiddenPP: toBool(isHiddenPPRaw),
    isHiddenPPRaw,
    isHidden: toBool(isHiddenRaw),
    isHiddenRaw,
  }
}

function readPitchFields(row) {
  const { getExact, getRegex } = buildValueGetter(row)
  const code =
    getExact('code', 'product_code', '商品編號', '商品代號', 'item_code', '品號') ||
    getRegex(/(^|.*)(product)?code$/, /商品(編號|代號)/, /品號/, /sku/)
  const name = getExact('name', 'product_name', '商品名稱', '品名') || getRegex(/(^|.*)name$/, /商品名稱/, /品名/, /名稱/)
  return {
    code,
    name,
    title: getExact('title', 'pitch_title', '主訴求', '標題') || getRegex(/title/, /主訴求/, /標題/),
    content:
      getExact('content', 'pitch_content', '銷售話術', '話術內容', '文案') ||
      getRegex(/content/, /話術/, /文案/),
    tags: getExact('tags', 'pitch_tags', '標籤', '關鍵字') || getRegex(/tags?/, /標籤/, /關鍵字/),
    isNew: toBool(getExact('isNew', 'is_new', '新品', 'new') || getRegex(/isnew/, /新品/, /new/)),
  }
}

function buildMergedFeed(productRows, pitchRows) {
  const pitchByCode = new Map()
  const pitchByName = new Map()

  for (const row of pitchRows) {
    const entry = readPitchFields(row)
    const pitch = {
      title: entry.title,
      content: entry.content,
      tags: entry.tags,
      isNew: entry.isNew,
      name: entry.name,
    }
    if (entry.code) pitchByCode.set(entry.code, pitch)
    if (entry.name) pitchByName.set(entry.name.trim().toLowerCase(), pitch)
  }

  const items = productRows
    .map((row) => {
      const entry = readProductFields(row)
      if (!entry.code || !entry.name) return null

      const pitch = pitchByCode.get(entry.code) || pitchByName.get(entry.name.trim().toLowerCase()) || {
        title: '',
        content: '',
        tags: '',
        isNew: false,
        name: entry.name,
      }

      return {
        code: entry.code,
        name: entry.name,
        category: entry.category,
        price: toNumber(entry.price),
        spec: entry.spec,
        photo: entry.photo,
        videoUrl: entry.videoUrl,
        moreLinksRaw: entry.moreLinksRaw,
        is_hidden_pp: entry.isHiddenPP,
        is_hidden: entry.isHidden,
        pitch,
      }
    })
    .filter(Boolean)

  return {
    schemaVersion: 1,
    buildId,
    generatedAt: nowIso,
    source: { ...SOURCE_URLS },
    count: items.length,
    items,
  }
}

function buildPromotions(rows) {
  const items = rows
    .map((row, index) => {
      const { getExact } = buildValueGetter(row)
      const ch = channelFlagsFromRow(getExact)
      const channelLabels = channelLabelsFromFlags(ch)
      const title = getExact('title', '活動名稱', 'promo_title', '促銷名稱')
      const shortTitle = getExact('shortTitle', '短標', '短標題', 'promo_short_title') || title
      const content = getExact('content', '活動說明', '促銷內容', 'promo_copy', '文案')
      const startDate = normalizeDateString(getExact('startDate', '開始日期', '活動開始日', 'start_date'))
      const endDate = normalizeDateString(getExact('endDate', '結束日期', '活動結束日', 'end_date'))
      const status = inferPromoStatus(getExact('status', '活動狀態', 'promo_status'), startDate, endDate)
      const relatedCodes = splitList(
        getExact('relatedCodes', '適用商品', '適用品號', '適用商品編號', 'product_codes', 'codes')
      )
      if (!title) return null
      return {
        promoId: getExact('promoId', '活動編號', 'id', 'promo_id') || `${new Date().getFullYear()}_${String(index + 1).padStart(3, '0')}`,
        title,
        shortTitle,
        content,
        imgUrl: getExact('imgUrl', '圖片連結', '圖檔連結', 'image_url', 'img', 'image'),
        relatedCodes,
        startDate,
        endDate,
        status,
        bgColor: getExact('bgColor', '背景色', '卡片底色', 'bg_color'),
        ch,
        channelLabels,
      }
    })
    .filter(Boolean)
  return { generatedAt: nowIso, count: items.length, items }
}

function buildRankingsFromMatrix(matrix, mergedFeed) {
  const nameByCode = new Map((mergedFeed.items || []).map((item) => [item.code, item.name]))

  const dataRows = matrix
    .slice(3)
    .filter((row) => row.some((v) => String(v || '').trim() !== ''))

  const normalizedRows = dataRows
    .map((row) => {
      const code = String(row[0] || '').trim()
      if (!code) return null

      const sheetName = String(row[1] || '').trim()
      const salesPrev = toNumber(row[2])
      const salesCurr = toNumber(row[3])
      const qtyPrev = toNumber(row[4])
      const qtyCurr = toNumber(row[5])

      return {
        code,
        name: nameByCode.get(code) || sheetName || '',
        salesTwdPrev: salesPrev,
        salesTwd2025: salesCurr,
        qtyPrev,
        qty2025: qtyCurr,
      }
    })
    .filter(Boolean)

  const items = normalizedRows
    .sort((a, b) => {
      if (b.qty2025 !== a.qty2025) return b.qty2025 - a.qty2025
      if (b.salesTwd2025 !== a.salesTwd2025) return b.salesTwd2025 - a.salesTwd2025
      return a.code.localeCompare(b.code)
    })
    .map((item, index) => ({
      code: item.code,
      name: item.name,
      salesTwd2025: item.salesTwd2025,
      qty2025: item.qty2025,
      rank: index + 1,
    }))

  return { generatedAt: nowIso, count: items.length, items }
}

async function writeJson(filename, payload) {
  const outputPath = path.join(OUTPUT_DIR, filename)

  try {
    const oldContent = await fs.readFile(outputPath, 'utf8')
    const oldData = JSON.parse(oldContent)
    const isDataSame = JSON.stringify(oldData.items) === JSON.stringify(payload.items)

    if (isDataSame) {
      console.log(`⏩ [跳過] ${filename} 資料無變動，保留原檔案以避免觸發 Git Commit`)
      return
    }
  } catch (e) {
    // 檔案不存在或解析失敗，屬正常現象，繼續往下執行寫入
  }

  await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log(`✅ [更新] 已輸出新的 ${outputPath}`)
}

function assertNonEmpty(payload, label) {
  if (!payload.count) {
    throw new Error(`${label} 產出 0 筆。請優先檢查：1) 對應 CSV URL 是否正確且已發布；2) 標題列欄名是否與 parser 對得上。`)
  }
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  const [productRows, pitchRows, promotionRows, rankMatrix] = await Promise.all([
    fetchCsvRows(SOURCE_URLS.products, 'products'),
    fetchCsvRows(SOURCE_URLS.pitch, 'pitch'),
    fetchCsvRows(SOURCE_URLS.promotions, 'promotions'),
    fetchCsvMatrix(SOURCE_URLS.rank, 'rankings'),
  ])

  const mergedFeed = buildMergedFeed(productRows, pitchRows)
  const promotions = buildPromotions(promotionRows)
  const rankings = buildRankingsFromMatrix(rankMatrix, mergedFeed)

  assertNonEmpty(mergedFeed, 'merged-feed.json')
  assertNonEmpty(rankings, 'rankings.json')

  await Promise.all([
    writeJson('merged-feed.json', mergedFeed),
    writeJson('promotions.json', promotions),
    writeJson('rankings.json', rankings),
  ])
}

main().catch((error) => {
  console.error('❌ build-json 失敗')
  console.error(error)
  process.exit(1)
})
