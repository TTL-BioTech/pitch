import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUp,
  BadgePercent,
  ChevronDown,
  ExternalLink,
  Gift,
  LayoutGrid,
  ImageIcon,
  Link2,
  Menu,
  Palette,
  PlayCircle,
  Printer,
  RefreshCw,
  Search,
  Settings2,
  Share2,
  Sparkles,
  Type,
  X,
  Share,
  Youtube,
  Facebook,
  Instagram,
  Globe,
  Store,
  MessageCircle,
  Compass,
  ArrowLeft,
  Coffee,
  Activity,
  Droplets,
  Download,
  SlidersHorizontal
} from 'lucide-react'
import { useAppStore } from './store/useAppStore'

// 🚀 PWA 全域事件捕捉：確保 React 載入前瀏覽器發出的安裝提示不會漏接
let globalPwaPrompt = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalPwaPrompt = e;
    window.dispatchEvent(new Event('pwa-ready')); 
  });
}

function cssSupports(property, value) {
  return typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports(property, value)
}

const isAppleTouchDevice = typeof navigator !== 'undefined' && (
  /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent)
) && (
  navigator.maxTouchPoints > 1 || /iPod|iPhone|iPad/.test(navigator.userAgent)
)

const needsConservativeMode = isAppleTouchDevice && (
  !cssSupports('height', '100dvh') ||
  !cssSupports('overscroll-behavior', 'contain')
)

const SCROLL_BEHAVIOR = needsConservativeMode ? 'auto' : 'smooth'
const SHEET_TRANSITION = needsConservativeMode
  ? { type: 'tween', duration: 0.18, ease: 'easeOut' }
  : { type: 'spring', stiffness: 260, damping: 24 }
const MODAL_TRANSITION = needsConservativeMode
  ? { type: 'tween', duration: 0.16, ease: 'easeOut' }
  : { type: 'spring', stiffness: 320, damping: 28 }
const FAB_ITEM_VARIANTS = needsConservativeMode
  ? {
      hidden: { opacity: 0, y: 10 },
      show: { opacity: 1, y: 0, transition: { type: 'tween', duration: 0.14, ease: 'easeOut' } },
    }
  : {
      hidden: { opacity: 0, y: 20, scale: 0.8 },
      show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
    }

const BOTTOM_SHEET_MAX_HEIGHT_STYLE = {
  maxHeight: 'calc(var(--app-height, 100vh) - env(safe-area-inset-top) - 8px)',
}

const CENTER_MODAL_MAX_HEIGHT_STYLE = {
  maxHeight: 'calc(var(--app-height, 100vh) - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 24px)',
}

const LIGHTBOX_IMAGE_MAX_STYLE = {
  maxHeight: 'calc(var(--app-height, 100vh) - 40px)',
  maxWidth: '95vw',
}

const MEDIA_SHEET_BODY_MAX_HEIGHT_STYLE = {
  maxHeight: 'calc(var(--app-height, 100vh) * 0.6)',
}

const BASE_URL = import.meta.env.BASE_URL || '/'
const STORAGE_KEYS = {
  theme: 'ttl-react-theme-v8',
  scale: 'ttl-react-scale-v8',
}

const CATEGORY_META = [
  { key: 'all', label: '全部', anchor: 'promo' },
  { key: '保健飲品', label: '保健飲品', anchor: 'sec-drinks' },
  { key: '保健食品', label: '保健食品', anchor: 'sec-health' },
  { key: '美容產品', label: '美容產品', anchor: 'sec-beauty' },
  { key: '清潔產品', label: '清潔產品', anchor: 'sec-cleaning' },
  { key: '其他', label: '其他', anchor: 'sec-other' },
]

const THEMES = [
  {
    key: 'ttl-classic',
    label: '薄荷綠',
    colors: {
      '--bg': '#f8f9fa',
      '--bg-soft': '#f0f4f8',
      '--surface': '#ffffff',
      '--surface-soft': '#fcfcfc',
      '--border': '#cfd8dc',
      '--text': '#263238',
      '--muted': '#546e7a',
      '--primary': '#0F766E',
      '--primary-strong': '#016b5f',
      '--primary-soft': '#eefbfa',
      '--promo': '#03a791',       
      '--promo-soft': '#e0f2f1',
      '--chip': '#eceff1',
      '--highlight': '#f8eb76',
      '--highlight-text': '#d81b60',
      '--price': '#d81b60',
      '--shadow': 'rgba(0,0,0,0.05)',
    },
  },
  {
    key: 'ttl-rose',
    label: '玫瑰金',
    colors: {
      '--bg': '#fff8fb',
      '--bg-soft': '#fff0f6',
      '--surface': '#ffffff',
      '--surface-soft': '#fff7fa',
      '--border': '#f4d7e3',
      '--text': '#38242f',
      '--muted': '#7e5a69',
      '--primary': '#c74d7c',
      '--primary-strong': '#a12d61',
      '--primary-soft': '#faebf0',
      '--promo': '#eb5986',       
      '--promo-soft': '#fce4ec',
      '--chip': '#fff2f7',
      '--highlight': '#ffeb3b',
      '--highlight-text': '#d81b60',
      '--price': '#d81b60',
      '--shadow': 'rgba(199, 77, 124, 0.12)',
    },
  },
  {
    key: 'ttl-blue',
    label: '沉穩藍',
    colors: {
      '--bg': '#f4f8fb',
      '--bg-soft': '#edf4f8',
      '--surface': '#ffffff',
      '--surface-soft': '#f6fafd',
      '--border': '#dbe6ee',
      '--text': '#2c3e50',
      '--muted': '#647a8f',
      '--primary': '#1f5486',
      '--primary-strong': '#396691',
      '--primary-soft': '#ecf4fa',
      '--promo': '#f1b44a',         
      '--promo-soft': '#fef3c7',
      '--chip': '#eaf1f6',
      '--highlight': '#fff59d',
      '--highlight-text': '#d81b60',
      '--price': '#ef4444',
      '--shadow': 'rgba(92, 143, 190, 0.12)',
    },
  },
  {
    key: 'ttl-purple',
    label: '優雅紫',
    colors: {
      '--bg': '#f8f6fc',
      '--bg-soft': '#f2eefa',
      '--surface': '#ffffff',
      '--surface-soft': '#f9f8fd',
      '--border': '#e2dcf2',
      '--text': '#352b47',
      '--muted': '#6b5e84',
      '--primary': '#6845a9',
      '--primary-strong': '#5f4197',
      '--primary-soft': '#f4f0f9',
      '--promo': '#f43f5e',         
      '--promo-soft': '#ffe4e6',
      '--chip': '#f0ebf8',
      '--highlight': '#fff59d',
      '--highlight-text': '#c2185b',
      '--price': '#e11d48',
      '--shadow': 'rgba(138, 103, 204, 0.12)',
    },
  },
]

const SCALE_PRESETS = {
  'A': { 
    rowImage: 80, detailImage: 110, name: 'text-[16px]', title: 'text-[14px]', price: 'text-[18px]', body: 'text-[15px]', tag: 'text-[11px] px-2 py-1', promoTag: 'text-[10px] px-1.5 py-0.5', icon: 'h-3 w-3',
    promoTitle: 'text-[15px]', promoBody: 'text-[12px]', promoDate: 'text-[10px] px-2 py-0.5', promoStatus: 'text-[10px] px-2.5 py-0.5', promoFilter: 'text-[12px] px-3 py-1.5', drawerTitle: 'text-[20px]', drawerDate: 'text-[12px]', drawerBody: 'text-[15px]', drawerRelatedTitle: 'text-[14px]', drawerRelatedName: 'text-[13px]', drawerRelatedPrice: 'text-[11px]'
  },
  'A+': { 
    rowImage: 100, detailImage: 120, name: 'text-[18px]', title: 'text-[16px]', price: 'text-[20px]', body: 'text-[16px]', tag: 'text-[13px] px-2.5 py-1', promoTag: 'text-[12px] px-2 py-1', icon: 'h-3.5 w-3.5',
    promoTitle: 'text-[17px]', promoBody: 'text-[14px]', promoDate: 'text-[12px] px-2.5 py-1', promoStatus: 'text-[12px] px-3 py-1', promoFilter: 'text-[14px] px-3.5 py-2', drawerTitle: 'text-[22px]', drawerDate: 'text-[14px]', drawerBody: 'text-[17px]', drawerRelatedTitle: 'text-[16px]', drawerRelatedName: 'text-[15px]', drawerRelatedPrice: 'text-[13px]'
  },
  'A++': { 
    rowImage: 120, detailImage: 130, name: 'text-[20px]', title: 'text-[18px]', price: 'text-[22px]', body: 'text-[18px]', tag: 'text-[15px] px-3 py-1.5', promoTag: 'text-[14px] px-2.5 py-1.5', icon: 'h-4 w-4',
    promoTitle: 'text-[19px]', promoBody: 'text-[16px]', promoDate: 'text-[14px] px-3 py-1', promoStatus: 'text-[14px] px-3 py-1', promoFilter: 'text-[16px] px-4 py-2', drawerTitle: 'text-[24px]', drawerDate: 'text-[16px]', drawerBody: 'text-[19px]', drawerRelatedTitle: 'text-[18px]', drawerRelatedName: 'text-[17px]', drawerRelatedPrice: 'text-[15px]'
  },
}


const PROMO_CHANNEL_OPTIONS = [
  { key: 'show', label: '展售中心' },
  { key: 'mart', label: '便利店' },
  { key: 'eshop', label: '購物網' },
  { key: 'office', label: '營業所' },
]

const PROMO_TITLE_TAG_RULES = [
  { label: '母親節', patterns: ['母親節'] },
  { label: '地球日', patterns: ['地球日'] },
  { label: '員購', patterns: ['員購'] },
  { label: '鄉民Q1', patterns: ['鄉民Q1'] },
  { label: '鄉民Q2', patterns: ['鄉民Q2'] },
  { label: '聖誕限定', patterns: ['聖誕'] },
  { label: '暖冬獻禮', patterns: ['暖冬'] },
  { label: '春季檔', patterns: ['春暖', '花開'] },
  { label: '棒球賽', patterns: ['棒球'] },
  { label: '新品上市', patterns: ['新品', '上市'] },
  { label: '即期去化', patterns: ['即期', '清倉', '惜福', '去化'] },
  { label: '滿額贈', patterns: ['滿額贈'] },
  { label: '買一送一', patterns: ['買一送一'] },
  { label: '買N送1', patterns: ['買3送1', '買2送1'] },
  { label: '任選優惠', patterns: ['任選'] },
  { label: '加價購', patterns: ['加價購'] },
  { label: '第二件優惠', patterns: ['第二件'] },
  { label: '搭贈', patterns: ['搭贈', '試用包'] },
  { label: '折扣', patterns: ['折', '優惠價'] },
  { label: '禮盒', patterns: ['禮盒'] },
  { label: '組合', patterns: ['組'] },
  { label: '洗沐', patterns: ['洗沐', '沐浴', '洗髮', '護髮', '洗面'] },
  { label: '美容保養', patterns: ['面膜', '精華', '乳液', '美白', '保濕', '抗皺', '青春'] },
  { label: '清潔用品', patterns: ['洗衣', '易洗樂', '洗手', '皂'] },
  { label: '保健食品', patterns: ['保健', '益生菌', '魚油', '紅麴', '膠囊', '雙效', 'S11'] },
  { label: '飲品', patterns: ['纖麥汁', '黑麥汁', '飲'] },
]

function getPromoChannelLabels(promo) {
  if (!promo) return []
  const labels = []
  if (promo.ch) {
    PROMO_CHANNEL_OPTIONS.forEach((option) => {
      if (promo.ch?.[option.key]) labels.push(option.label)
    })
  }
  if (Array.isArray(promo.channelLabels)) {
    promo.channelLabels.forEach((label) => { if (label) labels.push(label) })
  }
  if (!labels.length && promo.channel) {
    String(promo.channel).split(/[、,，/／\s]+/).forEach((label) => { if (label) labels.push(label) })
  }
  return [...new Set(labels)].filter((label) => PROMO_CHANNEL_OPTIONS.some((option) => option.label === label))
}

function extractPromoTitleTags(promo) {
  const title = String(promo?.title || promo?.shortTitle || '')
    .replace(/[【】\[\]（）()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!title) return []
  const tags = []
  PROMO_TITLE_TAG_RULES.forEach((rule) => {
    if (rule.patterns.some((pattern) => title.includes(pattern))) tags.push(rule.label)
  })
  return [...new Set(tags)].slice(0, 5)
}

function countOccurrences(items, getter) {
  const counts = new Map()
  items.forEach((item) => {
    getter(item).forEach((value) => counts.set(value, (counts.get(value) || 0) + 1))
  })
  return counts
}

const PROMO_STATUS_META = {
  active: { label: '進行中', className: 'border-orange-200 bg-orange-50 text-orange-700' },
  upcoming: { label: '即將開始', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  ended: { label: '已結束', className: 'border-slate-200 bg-slate-100 text-slate-600 line-through' },
}

function normalizeCategory(nameRaw, catRaw) {
  const n = String(nameRaw || '').toLowerCase();
  const c = String(catRaw || '').toLowerCase();

  if (n.includes('黑麥汁') || n.includes('甘益守禮盒') || n.includes('纖麥汁')) return '保健飲品';

  const cleaningKeywords = ['洗手', '潔手', '易洗樂', '洗潔', '洗衣', '洗碗', '菜瓜布', '皂', '沐浴', '洗髮', '洗面', '洗沐'];
  if (c.includes('清潔') || c.includes('洗沐') || cleaningKeywords.some(kw => n.includes(kw)) || (n.includes('洗') && n.includes('精'))) {
    return '清潔產品';
  }

  const beautyKeywords = ['vinata', '面膜', '精華', '霜', '露', '乳液', '潔顏', '卸妝', '美白', '保濕', '抗皺', '潤', '透', '亮', '膚', '痘'];
  if (c.includes('美容') || c.includes('保養') || beautyKeywords.some(kw => n.includes(kw))) {
    return '美容產品';
  }

  const healthKeywords = ['安可健', 's11', '益生菌', '納豆', '紅麴', '魚油', '鈣', '葡萄糖胺', '葉黃素', '膠囊', '錠', '酵素', '滴雞精'];
  if (c.includes('保健') || c.includes('健康') || c.includes('買一送一') || healthKeywords.some(kw => n.includes(kw))) {
    return '保健食品';
  }

  if (c.includes('飲品') || c.includes('飲料')) return '保健飲品';

  return '其他';
}

function getPromoGroups(promo) {
  const source = promo.relatedProducts || []
  const groups = [...new Set(source.map((item) => item?.group).filter(Boolean).filter((group) => group !== '其他'))]
  return groups.length ? groups : ['其他']
}

function getPromoImage(promo) {
  return promo.imgUrl || promo.img || ''
}

function parseTags(raw) {
  if (Array.isArray(raw)) return raw.filter(Boolean)
  if (!raw) return []
  return String(raw).split(/[，,]/).map((item) => item.trim()).filter(Boolean)
}

function parseMoreLinks(raw) {
  if (!raw) return []
  return String(raw).split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const parts = line.split('|')
    const type = parts[0] || ''
    const label = parts.length >= 3 ? parts[1] : (type || '更多素材')
    const url = parts.length >= 3 ? parts.slice(2).join('|') : (parts[1] || line)
    return { type, label, url }
  }).filter((item) => item.url)
}

function getYouTubeEmbed(url) {
  if (!url) return ''
  const match = String(url).match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/)
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1&playsinline=1` : ''
}

function getPromoDateValue(raw, fallback = Number.POSITIVE_INFINITY) {
  if (!raw) return fallback
  const normalized = String(raw).trim().replace(/[.]/g, '/').replace(/-/g, '/')
  const parsed = new Date(normalized)
  const time = parsed.getTime()
  return Number.isNaN(time) ? fallback : time
}

function placeholderSvg(label = 'TTL Bio-Tech') {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#f0f4f8"/><stop offset="1" stop-color="#cfd8dc"/></linearGradient></defs><rect width="480" height="360" fill="url(#g)" rx="28"/><text x="50%" y="46%" font-size="20" text-anchor="middle" fill="#546e7a" font-family="Arial, sans-serif">${label}</text><text x="50%" y="58%" font-size="13" text-anchor="middle" fill="#90a4ae" font-family="Arial, sans-serif">無圖片</text></svg>`)}`
}

function usePersistentState(key, fallback) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return fallback
    try {
      return window.localStorage.getItem(key) || fallback
    } catch { return fallback }
  })
  useEffect(() => {
    try { window.localStorage.setItem(key, value) } catch {}
  }, [key, value])
  return [value, setValue]
}

function useScrollSpy(ids, layoutReady) {
  const setActiveSection = useAppStore((state) => state.setActiveSection)

  useEffect(() => {
    if (!layoutReady || !ids.length) return undefined

    let ticking = false;

    const updateActiveSection = () => {
      const headerHeight = document.querySelector('header')?.offsetHeight || 140;
      const triggerY = headerHeight + 20; 
      
      let currentId = ids[0]; 
      
      for (let i = 0; i < ids.length; i++) {
        const el = document.getElementById(ids[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerY) {
            currentId = ids[i];
          }
        }
      }

      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
        currentId = ids[ids.length - 1];
      }

      setActiveSection(currentId);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateActiveSection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    updateActiveSection();
    const timer = setTimeout(updateActiveSection, 300);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    }
  }, [ids.join(','), layoutReady, setActiveSection])
}

function useBodyLock(locked) {
  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return undefined
    if (!locked) return undefined

    const body = document.body
    const html = document.documentElement
    const scrollY = window.scrollY
    const previous = {
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyOverflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
    }

    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    body.style.overflow = 'hidden'
    html.style.overflow = 'hidden'

    return () => {
      body.style.position = previous.bodyPosition
      body.style.top = previous.bodyTop
      body.style.left = previous.bodyLeft
      body.style.right = previous.bodyRight
      body.style.width = previous.bodyWidth
      body.style.overflow = previous.bodyOverflow
      html.style.overflow = previous.htmlOverflow
      window.scrollTo(0, scrollY)
    }
  }, [locked])
}

function useViewportCssVar() {
  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return undefined

    const root = document.documentElement
    const updateHeight = () => {
      const nextHeight = window.visualViewport?.height || window.innerHeight
      root.style.setProperty('--app-height', `${Math.round(nextHeight)}px`)
    }

    updateHeight()
    window.addEventListener('resize', updateHeight, { passive: true })
    window.addEventListener('orientationchange', updateHeight)
    window.visualViewport?.addEventListener('resize', updateHeight)
    window.visualViewport?.addEventListener('scroll', updateHeight)

    return () => {
      window.removeEventListener('resize', updateHeight)
      window.removeEventListener('orientationchange', updateHeight)
      window.visualViewport?.removeEventListener('resize', updateHeight)
      window.visualViewport?.removeEventListener('scroll', updateHeight)
    }
  }, [])
}

function HighlightText({ text, keyword }) {
  const keywords = Array.isArray(keyword) ? keyword : [keyword].filter(Boolean)
  if (!keywords.length || !text) return <>{text}</>
  
  const escapeRegExp = (string) => String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length)
  const regex = new RegExp(`(${sortedKeywords.map(escapeRegExp).join('|')})`, 'gi')
  const parts = String(text).split(regex)
  
  return (
    <>
      {parts.map((part, i) =>
        sortedKeywords.some(k => k.toLowerCase() === part.toLowerCase()) ? (
          <mark key={i} className="rounded-[2px] bg-[var(--highlight)] px-0.5 font-bold text-[var(--highlight-text)] shadow-sm">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3 border-l-4 border-[var(--primary)] pl-2">
      <div>
        <h2 className="text-[18px] font-black text-[var(--text)]">{title}</h2>
        {subtitle ? <p className="mt-1 text-xs text-[var(--muted)]">{subtitle}</p> : null}
      </div>
    </div>
  )
}

function CarouselCard({ children }) {
  return (
    <div className="w-[85vw] max-w-[300px] shrink-0 snap-start overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-md shadow-[var(--shadow)] transition-transform active:scale-[0.98]">
      {children}
    </div>
  )
}

function normalizeAssetUrl(url) {
  const raw = String(url || '').trim()
  if (!raw || raw.startsWith('data:')) return raw

  try {
    const parsed = new URL(raw, typeof window !== 'undefined' ? window.location.href : 'https://example.com')
    const hostname = parsed.hostname.toLowerCase()

    if ((hostname === 'github.com' || hostname.endsWith('.github.com')) && parsed.pathname.includes('/blob/')) {
      const parts = parsed.pathname.replace(/^\/+/, '').split('/')
      if (parts.length >= 5 && parts[2] === 'blob') {
        const [owner, repo, , branch, ...rest] = parts
        return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${rest.join('/')}`
      }
    }

    if (hostname === 'drive.google.com') {
      let fileId = ''
      const segments = parsed.pathname.split('/').filter(Boolean)
      const dIndex = segments.indexOf('d')
      if (dIndex >= 0 && segments[dIndex + 1]) {
        fileId = segments[dIndex + 1]
      }
      if (!fileId) {
        fileId = parsed.searchParams.get('id') || ''
      }
      if (fileId) {
        return `https://lh3.googleusercontent.com/d/${fileId}=w1200`
      }
    }

    return parsed.toString()
  } catch (error) {
    return raw
  }
}

// 🚀 自癒版 SafeImage：先做快速重試，失敗後進入低頻續試，不會過早永久放棄
function SafeImage({ src, alt, className, fallbackLabel, contain = false, blend = false, priority = false, retryProfile = 'default' }) {
  const imgRef = useRef(null)
  const retryTimerRef = useRef(null)
  const heartbeatTimerRef = useRef(null)
  const retryCountRef = useRef(0)
  const recoveryCountRef = useRef(0)
  const lastAttemptAtRef = useRef(0)
  const isInViewportRef = useRef(true)
  const retryConfig = useMemo(() => (
    retryProfile === 'promo'
      ? {
          quickRetryDelays: [1200, 3000, 6500, 12000, 20000],
          recoveryRetryDelays: [10000, 18000, 30000, 45000, 60000, 90000, 120000],
          viewportRootMargin: '600px 0px',
          recoveryCooldown: 2500,
          forceRecoveryCooldown: 900,
          heartbeatInterval: 18000,
        }
      : {
          quickRetryDelays: [1500, 4000, 8000],
          recoveryRetryDelays: [12000, 25000, 45000, 60000, 90000],
          viewportRootMargin: '240px 0px',
          recoveryCooldown: 6000,
          forceRecoveryCooldown: 1500,
          heartbeatInterval: 0,
        }
  ), [retryProfile])
  const fallbackSrc = placeholderSvg(fallbackLabel)
  const normalizedSrc = useMemo(() => normalizeAssetUrl(src), [src])
  const [currentSrc, setCurrentSrc] = useState(normalizedSrc || fallbackSrc)
  const [isRecoverable, setIsRecoverable] = useState(false)

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current) {
      window.clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
  }, [])

  const clearHeartbeatTimer = useCallback(() => {
    if (heartbeatTimerRef.current) {
      window.clearInterval(heartbeatTimerRef.current)
      heartbeatTimerRef.current = null
    }
  }, [])

  const buildRetryUrl = useCallback(() => {
    const separator = normalizedSrc.includes('?') ? '&' : '?'
    return `${normalizedSrc}${separator}img_retry=${Date.now()}`
  }, [normalizedSrc])

  const scheduleRecoveryRetry = useCallback(() => {
    if (!normalizedSrc || normalizedSrc.startsWith('data:')) return
    if (!isRecoverable) return

    clearRetryTimer()
    const idx = Math.min(recoveryCountRef.current, retryConfig.recoveryRetryDelays.length - 1)
    const delay = retryConfig.recoveryRetryDelays[idx]

    retryTimerRef.current = window.setTimeout(() => {
      const isPageVisible = typeof document === 'undefined' ? true : document.visibilityState === 'visible'
      const shouldAttempt = !needsConservativeMode || isPageVisible || isInViewportRef.current || retryProfile === 'promo'

      if (!shouldAttempt) {
        scheduleRecoveryRetry()
        return
      }

      recoveryCountRef.current += 1
      lastAttemptAtRef.current = Date.now()
      setCurrentSrc(buildRetryUrl())
    }, delay)
  }, [normalizedSrc, isRecoverable, clearRetryTimer, buildRetryUrl, retryConfig, retryProfile])

  const triggerRecoveryNow = useCallback((force = false) => {
    if (!normalizedSrc || normalizedSrc.startsWith('data:')) return
    if (!isRecoverable) return

    const now = Date.now()
    const cooldown = force ? retryConfig.forceRecoveryCooldown : retryConfig.recoveryCooldown
    if (now - lastAttemptAtRef.current < cooldown) return

    clearRetryTimer()
    lastAttemptAtRef.current = now
    recoveryCountRef.current += 1
    setCurrentSrc(buildRetryUrl())
  }, [normalizedSrc, isRecoverable, clearRetryTimer, buildRetryUrl, retryConfig])

  useEffect(() => {
    clearRetryTimer()
    clearHeartbeatTimer()
    retryCountRef.current = 0
    recoveryCountRef.current = 0
    lastAttemptAtRef.current = 0
    setIsRecoverable(false)
    setCurrentSrc(normalizedSrc || fallbackSrc)

    return () => {
      clearRetryTimer()
      clearHeartbeatTimer()
    }
  }, [normalizedSrc, fallbackSrc, clearRetryTimer, clearHeartbeatTimer])

  useEffect(() => {
    if (!isRecoverable || typeof window === 'undefined') return

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') triggerRecoveryNow(true)
    }
    const handleOnline = () => triggerRecoveryNow(true)
    const handleFocus = () => triggerRecoveryNow(false)
    const handlePageShow = () => triggerRecoveryNow(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('pageshow', handlePageShow)
    document.addEventListener('visibilitychange', handleVisibility)

    if (retryConfig.heartbeatInterval > 0) {
      heartbeatTimerRef.current = window.setInterval(() => {
        const isPageVisible = typeof document === 'undefined' ? true : document.visibilityState === 'visible'
        if (isPageVisible) triggerRecoveryNow(false)
      }, retryConfig.heartbeatInterval)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('pageshow', handlePageShow)
      document.removeEventListener('visibilitychange', handleVisibility)
      clearHeartbeatTimer()
    }
  }, [isRecoverable, triggerRecoveryNow, retryConfig, clearHeartbeatTimer])

  useEffect(() => {
    if (!imgRef.current || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewportRef.current = !!entry?.isIntersecting
        if (entry?.isIntersecting && isRecoverable) {
          triggerRecoveryNow(retryProfile === 'promo')
        }
      },
      { root: null, rootMargin: retryConfig.viewportRootMargin, threshold: 0.01 }
    )

    observer.observe(imgRef.current)
    return () => observer.disconnect()
  }, [isRecoverable, triggerRecoveryNow, retryConfig, retryProfile])

  useEffect(() => {
    if (isRecoverable) scheduleRecoveryRetry()
    return () => clearRetryTimer()
  }, [isRecoverable, scheduleRecoveryRetry, clearRetryTimer])

  const queueRetry = useCallback(() => {
    if (!normalizedSrc || normalizedSrc.startsWith('data:')) {
      setCurrentSrc(fallbackSrc)
      setIsRecoverable(false)
      return
    }

    const currentRetry = retryCountRef.current
    if (currentRetry >= retryConfig.quickRetryDelays.length) {
      setCurrentSrc(fallbackSrc)
      setIsRecoverable(true)
      return
    }

    retryCountRef.current += 1
    lastAttemptAtRef.current = Date.now()
    setCurrentSrc(fallbackSrc)
    clearRetryTimer()

    const delay = retryConfig.quickRetryDelays[currentRetry]
    retryTimerRef.current = window.setTimeout(() => {
      setCurrentSrc(buildRetryUrl())
    }, delay)
  }, [normalizedSrc, fallbackSrc, clearRetryTimer, buildRetryUrl, retryConfig])

  const handleLoad = useCallback(() => {
    clearRetryTimer()
    clearHeartbeatTimer()
    retryCountRef.current = 0
    recoveryCountRef.current = 0
    lastAttemptAtRef.current = 0
    setIsRecoverable(false)
  }, [clearRetryTimer, clearHeartbeatTimer])

  const imageHints = priority
    ? { loading: 'eager', decoding: 'auto', fetchPriority: 'high' }
    : needsConservativeMode
      ? {}
      : { loading: 'lazy', decoding: 'async', fetchPriority: 'auto' }

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={`${className} ${contain ? `object-contain ${blend ? 'mix-blend-multiply' : ''}`.trim() : 'object-cover'}`}
      onError={queueRetry}
      onLoad={handleLoad}
      {...imageHints}
    />
  )
}

function InstallPrompt() {
  const [showIos, setShowIos] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const showToast = useAppStore((state) => state.showToast)
  
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('ttl-pwa-prompt-dismissed') === 'true'
    }
    return false
  })

  useEffect(() => {
    if (typeof window === 'undefined' || isDismissed) return

    const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

    if (!isStandalone) {
      if (isIos) {
        const timer = setTimeout(() => setShowIos(true), 2500)
        return () => clearTimeout(timer)
      }
      
      if (globalPwaPrompt) setDeferredPrompt(globalPwaPrompt);
      
      const handleReady = () => setDeferredPrompt(globalPwaPrompt)
      const handleBefore = (e) => {
        e.preventDefault()
        setDeferredPrompt(e)
      }

      window.addEventListener('pwa-ready', handleReady)
      window.addEventListener('beforeinstallprompt', handleBefore)

      return () => {
        window.removeEventListener('pwa-ready', handleReady)
        window.removeEventListener('beforeinstallprompt', handleBefore)
      }
    }
  }, [isDismissed])

  const handleDismiss = useCallback(() => {
    sessionStorage.setItem('ttl-pwa-prompt-dismissed', 'true')
    setIsDismissed(true)
    setShowIos(false)
    setDeferredPrompt(null)
  }, [])

  const handleWebInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      showToast('感謝安裝！系統正在建立主畫面捷徑')
      handleDismiss()
    } else {
      handleDismiss()
    }
  }

  const dragProps = {
    drag: "x",
    dragConstraints: { left: 0, right: 0 },
    dragElastic: 0.7,
    onDragEnd: (e, { offset, velocity }) => {
      if (Math.abs(offset.x) > 80 || Math.abs(velocity.x) > 500) {
        handleDismiss();
      }
    }
  }

  return (
    <AnimatePresence>
      {showIos && (
        <div className="fixed bottom-[calc(30px+env(safe-area-inset-bottom))] inset-x-0 z-[100] flex justify-center pointer-events-none">
          <motion.div
            {...dragProps}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex w-[90%] max-w-[360px] flex-col items-center rounded-2xl bg-[#263238]/95 p-5 text-center text-white shadow-2xl backdrop-blur-md cursor-grab active:cursor-grabbing pointer-events-auto"
          >
            <button onClick={handleDismiss} className="absolute right-2 top-2 p-2 text-[#90a4ae] active:text-white"><X className="h-5 w-5" /></button>
            <p className="text-[15px] leading-relaxed pointer-events-none">
              點擊工具列上的 <Share className="mx-1 mb-1 inline h-[22px] w-[22px] text-[#4fc3f7] drop-shadow-[0_0_5px_rgba(79,195,247,0.6)]" /> 分享按鈕<br />
              並選擇 <b className="border-b border-white/30 font-bold text-white">「加入主畫面」</b>
            </p>
            <p className="mt-2 text-[12px] text-[#b0bec5] pointer-events-none">以獲得最佳 Web App 操作體驗</p>
            <div className="mt-3 h-[3px] w-12 rounded-full bg-white/20 pointer-events-none"></div>
            <p className="mt-1 text-[9px] text-white/40 tracking-wider pointer-events-none">⟷ 左右滑動隱藏</p>
          </motion.div>
        </div>
      )}

      {deferredPrompt && (
        <div className="fixed bottom-24 inset-x-0 z-[100] flex justify-center pointer-events-none">
          <motion.div
            {...dragProps}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-[90%] max-w-[360px] cursor-grab active:cursor-grabbing pointer-events-auto"
          >
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-[var(--primary)] p-4 text-white shadow-2xl ring-4 ring-white/10">
              <div className="flex items-center gap-3 pointer-events-none">
                <div className="rounded-xl bg-white/20 p-2"><Download className="h-6 w-6" /></div>
                <div className="text-left">
                  <p className="text-sm font-black">安裝 TTL 生技助手</p>
                  <p className="text-[11px] opacity-80">一鍵啟動，快速查閱商品資訊</p>
                </div>
              </div>
              <div className="flex flex-col items-center shrink-0">
                  <button onClick={handleWebInstall} className="rounded-full bg-white px-4 py-2 text-xs font-black text-[var(--primary)] shadow-sm active:scale-95">立即安裝</button>
                  <p className="mt-1.5 text-[9px] font-bold text-white/50 tracking-wider pointer-events-none">⟷ 滑動隱藏</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function LoaderOverlay({ progress, stage }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[80] flex items-center justify-center bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="w-[min(90vw,340px)] rounded-[22px] border border-white/50 bg-white/90 p-6 text-center shadow-2xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-bold text-[var(--primary)]">
          <Sparkles className="h-4 w-4" /> 台酒生技
        </div>
        <h3 className="mt-4 text-[17px] font-black text-[var(--text)]">正在準備銷售支援內容</h3>
        <p className="mt-2 text-xs text-[var(--muted)]">首次啟動時，系統會先同步主資料並建立商品卡。</p>
        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-[var(--primary-soft)] via-[var(--primary)] to-[var(--primary-strong)]" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>
        <p className="mt-3 text-[14px] font-bold text-[var(--text)]">{stage}</p>
      </div>
    </motion.div>
  )
}

function ToastMessage() {
  const toast = useAppStore((state) => state.toast)
  const clearToast = useAppStore((state) => state.clearToast)
  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => clearToast(toast.id), 2500)
    return () => window.clearTimeout(timer)
  }, [toast, clearToast])
  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          className="fixed bottom-24 left-1/2 z-[90] flex w-max max-w-[90%] -translate-x-1/2 items-center justify-center gap-2 rounded-full bg-black/90 px-6 py-3 text-[16px] font-bold text-white shadow-xl backdrop-blur-sm"
        >
          {toast.message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function SettingsPanel({ open, onClose, theme, setTheme, scale, setScale }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={SHEET_TRANSITION}
            onClick={(event) => event.stopPropagation()}
            style={BOTTOM_SHEET_MAX_HEIGHT_STYLE} className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-2xl overflow-y-auto rounded-t-[24px] bg-[var(--surface)] px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4 shadow-2xl"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[var(--text)]">系統顯示設定</h3>
              <button onClick={onClose} className="rounded-full bg-[var(--surface-soft)] p-2 text-[var(--muted)]"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-6 space-y-6">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--text)]"><Type className="h-4 w-4" />字級與排版密度</div>
                <div className="flex gap-3">
                  {Object.keys(SCALE_PRESETS).map((key) => (
                    <button key={key} onClick={() => setScale(key)} className={`flex-1 rounded-xl border py-2.5 text-sm font-bold transition ${scale === key ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-md' : 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)]'}`}>
                      {key}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--text)]"><Palette className="h-4 w-4" />品牌配色主題</div>
                <div className="grid grid-cols-2 gap-3">
                  {THEMES.map((item) => (
                    <button key={item.key} onClick={() => setTheme(item.key)} className={`flex items-center gap-3 rounded-xl border p-3 transition ${theme === item.key ? 'border-[var(--primary)] bg-[var(--primary-soft)] ring-2 ring-[var(--primary)] ring-offset-1' : 'border-[var(--border)] bg-[var(--surface-soft)]'}`}>
                      <div className="flex h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[var(--border)]">
                        <div className="h-full w-1/2" style={{ background: item.colors['--bg'] }} />
                        <div className="h-full w-1/2" style={{ background: item.colors['--primary'] }} />
                      </div>
                      <span className="text-sm font-bold text-[var(--text)]">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function PromoCarousel({ items, onOpenPromo, onOpenCenter, scale }) {
  if (!items.length) return null
  const preset = SCALE_PRESETS[scale]

  return (
    <section id="promo" data-spy-section className="scroll-mt-[185px]">
      <div className="mb-3 flex items-end justify-between gap-3 border-l-4 border-[var(--primary)] pl-2">
        <div>
          <h2 className="text-[18px] font-black text-[var(--text)]">🔥 促銷焦點</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">左右滑動檢視近期活動</p>
        </div>
        <button onClick={onOpenCenter} className="flex shrink-0 items-center gap-1 rounded-full border border-[var(--promo)] bg-[var(--promo-soft)] px-3 py-1.5 text-[12px] font-black text-[var(--promo)] shadow-sm active:scale-95">
          <Compass className="h-3.5 w-3.5" /> 檔期檢視
        </button>
      </div>
      <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 md:-mx-0 md:px-0">
        {items.map((promo, promoIndex) => {
          const statusMeta = PROMO_STATUS_META[promo.status] || PROMO_STATUS_META.active
          const promoImage = getPromoImage(promo)
          return (
            <CarouselCard key={promo.promoId}>
              <button onClick={() => onOpenPromo(promo)} className="flex h-full w-full flex-col text-left">
                <div className="relative h-[120px] w-full shrink-0 bg-slate-100 overflow-hidden">
                  {promoImage ? <SafeImage src={promoImage} alt={promo.title} fallbackLabel={promo.title} className="h-full w-full" priority={promoIndex < 2} retryProfile="promo" /> : <div className="flex h-full items-center justify-center text-slate-400"><BadgePercent className="h-10 w-10" /></div>}
                  <div className={`absolute left-2 top-2 rounded-full border font-bold shadow-sm backdrop-blur-sm ${statusMeta.className} ${preset.promoStatus}`}>
                    {statusMeta.label}
                  </div>
                  <div className={`absolute right-2 top-2 rounded-full bg-white/90 font-bold shadow-sm backdrop-blur-sm ${preset.promoDate}`} style={{ color: 'var(--promo)' }}>
                    {promo.endDate || promo.startDate}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <h3 className={`line-clamp-2 font-black leading-tight text-[var(--text)] ${preset.promoTitle}`}>{promo.shortTitle || promo.title}</h3>
                  <p className={`mt-1.5 line-clamp-2 flex-1 leading-relaxed text-[var(--muted)] ${preset.promoBody}`}>{promo.content}</p>
                  
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {promo.channel && (
                      <span className={`flex items-center gap-0.5 rounded bg-slate-100 font-bold text-slate-500 ${preset.promoTag}`}>
                        <Store className={preset.icon} /> {promo.channel}
                      </span>
                    )}
                    {getPromoGroups(promo).slice(0,2).map((group) => (
                      <span key={group} className={`rounded-full font-bold ${preset.promoTag}`} style={{ background: 'var(--promo-soft)', color: 'var(--promo)' }}>
                        {group}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            </CarouselCard>
          )
        })}
      </div>
    </section>
  )
}

function RankingCarousel({ items, onOpenProduct, subtitle, category, setCategory }) {
  if (!items.length && category === 'all') return null
  
  const tabs = [
    { key: 'all', label: '全部' },
    { key: '保健食品', label: '保健' },
    { key: '美容產品', label: '美容' },
    { key: '清潔產品', label: '清潔' }
  ]

  return (
    <section id="hot" data-spy-section className="scroll-mt-[185px]">
      <div className="mb-3 flex items-end justify-between gap-3 border-l-4 border-[var(--primary)] pl-2">
        <div>
          <h2 className="text-[18px] font-black text-[var(--text)]">👑 熱銷排行</h2>
          {subtitle ? <p className="mt-1 text-xs text-[var(--muted)]">{subtitle}</p> : null}
        </div>
        <div className="flex shrink-0 gap-1 pr-4">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setCategory(tab.key)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition active:scale-95 ${category === tab.key ? 'bg-[var(--primary)] text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-4 md:-mx-0 md:px-0">
        {items.length > 0 ? items.map((product, productIndex) => (
          <div key={product.code} className="w-[110px] shrink-0 snap-start">
            <button onClick={() => onOpenProduct(product.code)} className="flex w-full flex-col items-center gap-2 text-center transition-transform active:scale-95">
              <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-2 shadow-sm">
                <SafeImage src={product.photo} alt={product.name} fallbackLabel={product.name} contain className="h-full w-full" priority={productIndex < 4} />
                <div className={`absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-br-lg text-[12px] font-black text-white shadow-sm ${product.displayRank === 1 ? 'bg-[#ffd700] text-[#3e2723]' : product.displayRank === 2 ? 'bg-[#cfd8dc] text-[#37474f]' : product.displayRank === 3 ? 'bg-[#d7ccc8] text-[#3e2723]' : 'bg-black/60'}`}>
                  {product.displayRank}
                </div>
              </div>
              <p className="line-clamp-2 text-[12px] font-bold leading-tight text-[var(--text)]">{product.name}</p>
            </button>
          </div>
        )) : (
          <div className="py-6 w-full text-center text-sm text-[var(--muted)]">此分類暫無熱銷商品</div>
        )}
      </div>
    </section>
  )
}

function ProductRow({ product, scale, keyword, onOpenProductByCode, onApplyTagFilter, onOpenPromo, priority = false }) {
  const expandedCardId = useAppStore((state) => state.expandedCardId)
  const setExpandedCardId = useAppStore((state) => state.setExpandedCardId)
  const openLightbox = useAppStore((state) => state.openLightbox)
  const openVideo = useAppStore((state) => state.openVideo)
  const openMediaSheet = useAppStore((state) => state.openMediaSheet)
  const seenVideos = useAppStore((state) => state.seenVideos)
  const markVideoSeen = useAppStore((state) => state.markVideoSeen)
  const showToast = useAppStore((state) => state.showToast)
  const cardRef = useRef(null)
  const isExpanded = expandedCardId === product.code
  const scalePreset = SCALE_PRESETS[scale]

  const toggle = () => {
    const willExpand = expandedCardId !== product.code
    setExpandedCardId(product.code)
    if (willExpand) {
      if (typeof window !== 'undefined') window.history.pushState({ ui: 'card', code: product.code }, '')
      window.setTimeout(() => {
        const el = cardRef.current
        if (el) {
          const headerHeight = document.querySelector('header')?.offsetHeight || 140
          const y = el.getBoundingClientRect().top + window.scrollY - headerHeight - 10
          window.scrollTo({ top: y, behavior: SCROLL_BEHAVIOR })
        }
      }, 280)
    } else {
      if (window.history.state?.ui === 'card') window.history.back()
    }
  }

  const copyPitch = async () => {
    const payload = `【 ✨ 產品推薦 】\n🌿 ${product.name}\n-------------------\n💬 主打：${product.title}\n📝 特色：${product.content}\n💰 優惠價：$${product.price.toLocaleString()}\n${product.tags.map(t => '#' + t).join(' ')}\n-------------------\n(台酒生技)`
    try {
      await navigator.clipboard.writeText(payload)
      showToast(<span><Sparkles className="inline mb-1 h-5 w-5"/> 已複製銷售文案</span>)
    } catch {
      showToast('複製失敗，請稍後再試')
    }
  }

  const openVideoInline = () => {
    if (!product.videoUrl) return
    markVideoSeen(product.code, product.videoUrl)
    
    const embedUrl = getYouTubeEmbed(product.videoUrl)
    const isMp4 = product.videoUrl.toLowerCase().endsWith('.mp4')
    
    if (!embedUrl && !isMp4) {
      window.open(product.videoUrl, '_blank')
      return
    }

    openVideo({ title: product.name, url: product.videoUrl })
    if (typeof window !== 'undefined') window.history.pushState({ ui: 'video', code: product.code }, '')
  }

  const hasSeenVideo = Boolean(seenVideos[product.code])

  return (
    <div ref={cardRef} className={`relative overflow-hidden rounded-xl border bg-[var(--surface)] transition-all ${isExpanded ? 'border-[var(--primary)] shadow-lg shadow-[var(--primary)]/10' : 'border-[var(--border)] shadow-sm'}`}>
      {product.isNew && (
        <div className="absolute left-0 top-0 z-10 flex items-center gap-0.5 rounded-br-[10px] bg-[#ff5252] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
          NEW
        </div>
      )}
      
      <div onClick={toggle} className="relative flex w-full cursor-pointer items-center gap-3 p-3 text-left">
        <div className="relative shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-[#fcfcfc]" style={{ width: scalePreset.rowImage, height: scalePreset.rowImage }} onClick={(event) => { if (isExpanded) { event.stopPropagation(); openLightbox({ src: product.photo || placeholderSvg(product.name), title: product.name }) } }}>
          <SafeImage src={product.photo} alt={product.name} fallbackLabel={product.name} contain className="h-full w-full p-1" blend priority={priority} />
          {product.videoUrl && (
            <div className={`absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full border border-white/30 text-white backdrop-blur-sm shadow-sm ${hasSeenVideo ? 'bg-black/40' : 'bg-[var(--promo)] ring-2 ring-[var(--promo)]/35'}`}>
              <PlayCircle className="h-3.5 w-3.5" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-mono text-[10px] text-[var(--muted)]"><HighlightText text={product.code} keyword={keyword} /></p>
              <h3 className={`mt-0.5 line-clamp-2 font-black leading-snug text-[var(--text)] ${scalePreset.name}`}>
                <HighlightText text={product.name} keyword={keyword} />
              </h3>
              <p className={`mt-0.5 line-clamp-2 font-bold text-[var(--primary)] ${scalePreset.title}`}><HighlightText text={product.title || product.spec || ''} keyword={keyword} /></p>
              {product.spec && product.spec !== product.title ? <p className="mt-0.5 text-[11px] text-[var(--muted)] line-clamp-1">{product.spec}</p> : null}
              
              <div className="mt-1 flex flex-wrap gap-1.5">
                {product.promos.map((promo) => (
                  <button 
                    key={promo.promoId} 
                    onClick={(e) => { e.stopPropagation(); onOpenPromo(promo); }}
                    className={`flex items-start text-left gap-1 rounded border ${scalePreset.promoTag} font-bold transition active:scale-95`} 
                    style={{ borderColor: 'var(--primary)', background: 'var(--primary-soft)', color: 'var(--primary)' }}
                  >
                    <Gift className={`${scalePreset.icon} shrink-0 mt-[2px]`} />
                    <span>{promo.shortTitle || promo.title}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className={`font-black text-[var(--price)] ${scalePreset.price}`}>
                <span className="text-xs mr-0.5">$</span>{product.price.toLocaleString()}
              </p>
              <ChevronDown className={`ml-auto mt-2 h-5 w-5 text-slate-300 transition-transform ${isExpanded ? 'rotate-180 text-[var(--primary)]' : ''}`} />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-[var(--border)] bg-[#fafafa]"
          >
            <div className="p-4">
              {product.title && (
                <div className={`mb-1.5 flex items-center gap-1 font-black text-[var(--primary)] ${scalePreset.name}`}>
                  <span className="text-[#ffd700]">★</span>
                  <HighlightText text={product.title} keyword={keyword} />
                </div>
              )}
              <p className={`whitespace-pre-line leading-relaxed text-[#455a64] ${scalePreset.body}`}>{product.content || <span className="text-sm text-slate-400">尚無詳細資料</span>}</p>
              
              {product.tags && product.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <button key={tag} onClick={() => onApplyTagFilter(product.code, tag)} className={`rounded bg-[var(--chip)] ${scalePreset.tag} text-[var(--muted)] transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] active:scale-95`}>
                      #<HighlightText text={tag} keyword={keyword} />
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                {product.videoUrl && (
                  <button onClick={openVideoInline} className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition active:scale-95 ${hasSeenVideo ? 'bg-slate-200 text-slate-600' : 'bg-[var(--promo)] text-white shadow-md'}`}>
                    <PlayCircle className="h-4 w-4" />商品影片
                  </button>
                )}
                {product.moreLinks.length > 0 && (
                  <button onClick={() => { openMediaSheet(product); if (typeof window !== 'undefined') window.history.pushState({ ui: 'sheet', code: product.code }, '') }} className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--text)] transition active:scale-95">
                    <Link2 className="h-4 w-4" />更多素材
                  </button>
                )}
                <button onClick={copyPitch} className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--muted)] transition active:scale-95 hover:bg-slate-50">
                  <Share2 className="h-4 w-4" />分享
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function MediaSheet() {
  const activeModal = useAppStore((state) => state.activeModal)
  const mediaSheetProduct = useAppStore((state) => state.mediaSheetProduct)
  const closeModal = useAppStore((state) => state.closeModal)
  if (activeModal !== 'sheet' || !mediaSheetProduct) return null

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[75] bg-black/55 backdrop-blur-[3px]" onClick={closeModal}>
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={SHEET_TRANSITION}
          onClick={(event) => event.stopPropagation()}
          style={BOTTOM_SHEET_MAX_HEIGHT_STYLE} className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-lg overflow-y-auto rounded-t-[24px] bg-white px-4 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4 shadow-2xl"
        >
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <p className="text-[14px] font-black text-[var(--text)] flex items-center gap-1.5"><Link2 className="h-4 w-4 text-[var(--muted)]"/>更多素材</p>
              <p className="mt-0.5 text-[12px] text-[var(--muted)]">商品：{mediaSheetProduct.name}</p>
            </div>
            <button onClick={closeModal} className="rounded-full bg-slate-100 p-2 text-slate-500"><X className="h-5 w-5" /></button>
          </div>
          <div style={MEDIA_SHEET_BODY_MAX_HEIGHT_STYLE} className="mt-3 overflow-y-auto space-y-2 pb-4">
            {mediaSheetProduct.moreLinks.length ? mediaSheetProduct.moreLinks.map((item, index) => {
              let IconTag = Globe;
              let iconColor = 'bg-slate-500';
              if (item.type === 'yt') { IconTag = Youtube; iconColor = 'bg-[#ff0000]'; }
              else if (item.type === 'fb') { IconTag = Facebook; iconColor = 'bg-[#1877f2]'; }
              else if (item.type === 'ig') { IconTag = Instagram; iconColor = 'bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888]'; }
              else if (item.type === 'line') { IconTag = MessageCircle; iconColor = 'bg-[#00c300]'; }
              
              return (
                <a key={`${item.url}-${index}`} href={item.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-[14px] font-bold text-[var(--text)] active:bg-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm ${iconColor}`}>
                      <IconTag className="h-4 w-4" />
                    </div>
                    {item.label}
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </a>
              )
            }) : <div className="py-8 text-center text-sm text-[var(--muted)]"><Search className="mx-auto mb-2 h-8 w-8 text-slate-300"/>沒有可用的連結</div>}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function VideoModal() {
  const activeModal = useAppStore((state) => state.activeModal)
  const videoPayload = useAppStore((state) => state.videoPayload)
  const closeModal = useAppStore((state) => state.closeModal)
  if (activeModal !== 'video' || !videoPayload) return null
  
  const embedUrl = getYouTubeEmbed(videoPayload.url)
  const isVertical = /shorts\//i.test(videoPayload.url)

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[76] bg-black/80 backdrop-blur-sm" onClick={closeModal}>
        <motion.div initial={needsConservativeMode ? { opacity: 0, y: 16 } : { opacity: 0, scale: 0.96 }} animate={needsConservativeMode ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1 }} exit={needsConservativeMode ? { opacity: 0, y: 12 } : { opacity: 0, scale: 0.96 }} transition={MODAL_TRANSITION} onClick={(event) => event.stopPropagation()} style={CENTER_MODAL_MAX_HEIGHT_STYLE} className="absolute inset-x-4 top-1/2 mx-auto flex w-[min(100%,760px)] max-w-[calc(100vw-2rem)] -translate-y-1/2 flex-col overflow-hidden rounded-[20px] bg-white shadow-2xl">
          <div className="flex shrink-0 items-start justify-between border-b border-slate-100 p-3">
            <div className="min-w-0 pr-3">
              <h3 className="flex items-center gap-1.5 text-[15px] font-black text-[var(--text)]"><PlayCircle className="h-4 w-4 text-[var(--muted)]"/>商品影片</h3>
              <p className="mt-0.5 truncate text-[12px] text-[var(--muted)]">{videoPayload.title}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <a href={videoPayload.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800">
                <ExternalLink className="h-3 w-3"/>外部開啟
              </a>
              <button onClick={closeModal} className="rounded-full bg-slate-100 p-1.5 text-slate-500"><X className="h-5 w-5" /></button>
            </div>
          </div>
          <div className="bg-black flex-1 relative flex flex-col justify-center">
            <div className={`relative ${isVertical ? 'mx-auto w-[min(100%,400px)] pt-[177.78%]' : 'w-full pt-[56.25%]'}`}>
              {embedUrl ? <iframe src={embedUrl} title={videoPayload.title} className="absolute inset-0 h-full w-full border-0 bg-black" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen playsInline /> : <video src={videoPayload.url} autoPlay controls className="absolute inset-0 h-full w-full bg-black object-contain" playsInline />}
            </div>
            <div className="p-3 bg-black text-center border-t border-slate-800">
              <a href={videoPayload.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition">
                <span>影片若無法播放，請點此使用外部 App 開啟</span> <ExternalLink className="h-4 w-4"/>
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function LightboxModal() {
  const activeModal = useAppStore((state) => state.activeModal)
  const lightbox = useAppStore((state) => state.lightbox)
  const closeModal = useAppStore((state) => state.closeModal)
  if (activeModal !== 'lightbox' || !lightbox) return null
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[77] flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={closeModal}>
        <button onClick={closeModal} className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white backdrop-blur-md"><X className="h-6 w-6" /></button>
        <motion.div initial={needsConservativeMode ? { opacity: 0, y: 12 } : { scale: 0.9 }} animate={needsConservativeMode ? { opacity: 1, y: 0 } : { scale: 1 }} exit={needsConservativeMode ? { opacity: 0, y: 12 } : { scale: 0.9 }} transition={MODAL_TRANSITION} onClick={(e) => e.stopPropagation()} style={LIGHTBOX_IMAGE_MAX_STYLE} className="w-full"><SafeImage src={lightbox.src} alt={lightbox.title} fallbackLabel={lightbox.title} contain className="h-full w-full" /></motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function FabMenu({ onScrollTop, onGotoPromo, onToggleSettings, onGotoSection }) {
  const fabOpen = useAppStore((state) => state.fabOpen)
  const toggleFab = useAppStore((state) => state.toggleFab)
  const closeFab = useAppStore((state) => state.closeFab)
  
  const [navMode, setNavMode] = useState(false)

  useEffect(() => {
    if (!fabOpen) {
      const t = setTimeout(() => setNavMode(false), 300)
      return () => clearTimeout(t)
    }
  }, [fabOpen])

  const mainActions = [
    { key: 'refresh', label: '重新整理', icon: RefreshCw, onClick: () => { closeFab(); window.location.reload(); } },
    { key: 'settings', label: '顯示設定', icon: Settings2, onClick: () => { closeFab(); onToggleSettings(); } },
    { key: 'nav', label: '分類導航', icon: Compass, onClick: () => setNavMode(true) },
    { key: 'top', label: '回到最頂端', icon: ArrowUp, onClick: () => { closeFab(); onScrollTop(); } },
  ]

  const navActions = [
    { key: 'back', label: '返回', icon: ArrowLeft, onClick: () => setNavMode(false) },
    { key: 'sec-drinks', label: '保健飲品', icon: Coffee, onClick: () => { closeFab(); onGotoSection('sec-drinks'); } },
    { key: 'sec-health', label: '保健食品', icon: Activity, onClick: () => { closeFab(); onGotoSection('sec-health'); } },
    { key: 'sec-beauty', label: '美容產品', icon: Sparkles, onClick: () => { closeFab(); onGotoSection('sec-beauty'); } },
    { key: 'sec-cleaning', label: '清潔產品', icon: Droplets, onClick: () => { closeFab(); onGotoSection('sec-cleaning'); } },
  ]

  const actions = navMode ? navActions : mainActions

  return (
    <div className="fixed bottom-[calc(20px+env(safe-area-inset-bottom))] right-4 z-[72] flex flex-col items-end gap-3">
      <button onClick={onGotoPromo} className="promo-balloon flex h-[46px] w-[46px] items-center justify-center rounded-full text-white shadow-lg outline-none" style={{ background: 'var(--promo)' }}>
        <BadgePercent className="h-6 w-6" />
      </button>
      <AnimatePresence mode="wait">
        {fabOpen && (
          <motion.div 
            key={navMode ? 'nav' : 'main'} 
            initial="hidden" 
            animate="show" 
            exit="hidden" 
            variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.02 } }, hidden: { transition: { staggerChildren: 0.03, staggerDirection: -1 } } }} 
            className="absolute bottom-16 right-0 flex flex-col items-end gap-2"
          >
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={action.key}
                  variants={FAB_ITEM_VARIANTS}
                  onClick={action.onClick}
                  className="flex h-[40px] items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-700 shadow-md"
                >
                  {action.label}
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100"><Icon className="h-4 w-4 text-[var(--primary)]" /></div>
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={toggleFab} className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-xl outline-none transition-transform active:scale-90">
        <Menu className={`h-6 w-6 transition-transform duration-300 ${fabOpen ? 'rotate-90' : ''}`} />
      </button>
    </div>
  )
}

function PromoDrawer({ promo, onClose, onNavigateToProduct, scale }) {
  if (!promo) return null
  const preset = SCALE_PRESETS[scale]

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[74] bg-black/70 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={SHEET_TRANSITION} onClick={(event) => event.stopPropagation()} style={BOTTOM_SHEET_MAX_HEIGHT_STYLE} className="absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-lg flex-col rounded-t-[24px] bg-white shadow-2xl">
          <div className="flex shrink-0 items-start justify-between border-b border-slate-100 p-4 pb-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className={`font-bold text-[var(--primary)] ${preset.drawerDate}`}>{promo.startDate} ~ {promo.endDate}</p>
                {promo.channel && (
                  <span className={`flex items-center gap-0.5 rounded-full bg-slate-100 font-bold text-slate-500 ${preset.promoTag}`}>
                    <Store className={preset.icon} /> {promo.channel}
                  </span>
                )}
              </div>
              <h3 className={`font-black text-[var(--text)] leading-tight ${preset.drawerTitle}`}>{promo.title}</h3>
            </div>
            <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500 shrink-0"><X className="h-5 w-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 pb-[calc(20px+env(safe-area-inset-bottom))]">
            {getPromoImage(promo) && <div className="mb-4 overflow-hidden rounded-xl bg-slate-100"><SafeImage src={getPromoImage(promo)} alt="活動" fallbackLabel={promo.title} contain className="w-full max-h-[40vh]" retryProfile="promo" /></div>}
            <p className={`whitespace-pre-line leading-relaxed text-[var(--text)] ${preset.drawerBody}`}>{promo.content}</p>
            
            {promo.relatedProducts && promo.relatedProducts.length > 0 && (
              <div className="mt-8 border-t border-slate-100 pt-5">
                <h4 className={`mb-3 flex items-center gap-1.5 font-bold text-[var(--primary)] ${preset.drawerRelatedTitle}`}>
                  <Gift className={preset.icon} /> 適用此活動的商品
                </h4>
                <div className="grid gap-2">
                  {promo.relatedProducts.map(product => (
                    <button
                      key={product.code}
                      onClick={() => onNavigateToProduct(product.code)}
                      className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-2 transition active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[#fcfcfc]">
                          <SafeImage src={product.photo} alt={product.name} fallbackLabel={product.name} contain className="h-full w-full p-0.5" />
                        </div>
                        <div className="text-left min-w-0">
                          <p className={`line-clamp-1 font-bold text-[var(--text)] ${preset.drawerRelatedName}`}>{product.name}</p>
                          <p className={`font-bold text-[var(--price)] ${preset.drawerRelatedPrice}`}>${product.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <ChevronDown className="mr-1 h-5 w-5 shrink-0 -rotate-90 text-[var(--primary)]" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function PromoCenterPanel({
  open,
  items,
  statusFilter,
  setStatusFilter,
  groupFilter,
  setGroupFilter,
  titleTagFilter,
  setTitleTagFilter,
  channelFilter,
  setChannelFilter,
  onOpenPromo,
  onClose,
  scale,
}) {
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  useEffect(() => {
    if (!open) setFilterSheetOpen(false)
  }, [open])

  const openFilterSheet = useCallback(() => {
    setFilterSheetOpen(true)
    if (typeof window !== 'undefined') window.history.pushState({ ui: 'promo-filter' }, '')
  }, [])

  const closeFilterSheet = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.state?.ui === 'promo-filter') {
      window.history.back()
    } else {
      setFilterSheetOpen(false)
    }
  }, [])

  useEffect(() => {
    const handleFilterPopState = (event) => {
      if (filterSheetOpen && event.state?.ui !== 'promo-filter') {
        setFilterSheetOpen(false)
      }
    }
    window.addEventListener('popstate', handleFilterPopState)
    return () => window.removeEventListener('popstate', handleFilterPopState)
  }, [filterSheetOpen])

  if (!open) return null

  const availableGroups = ['all', ...CATEGORY_META.filter((item) => item.key !== 'all' && item.key !== '其他').map((item) => item.key)]
  const titleTagCounts = countOccurrences(items, extractPromoTitleTags)
  const availableTitleTags = [
    'all',
    ...Array.from(titleTagCounts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hant'))
      .map(([tag]) => tag),
  ]
  const channelCounts = countOccurrences(items, getPromoChannelLabels)
  const availableChannels = [
    'all',
    ...PROMO_CHANNEL_OPTIONS.filter((option) => channelCounts.has(option.label)).map((option) => option.label),
  ]

  const filtered = items.filter((promo) => {
    const titleTags = extractPromoTitleTags(promo)
    const channelLabels = getPromoChannelLabels(promo)
    const statusOk = statusFilter === 'all' || promo.status === statusFilter
    const groupOk = groupFilter === 'all' || getPromoGroups(promo).includes(groupFilter)
    const titleTagOk = titleTagFilter === 'all' || titleTags.includes(titleTagFilter)
    const channelOk = channelFilter === 'all' || channelLabels.includes(channelFilter)
    return statusOk && groupOk && titleTagOk && channelOk
  })
  
  const preset = SCALE_PRESETS[scale]
  const activeAdvancedFilters = [
    titleTagFilter !== 'all' ? { key: 'titleTag', label: `#${titleTagFilter}` } : null,
    channelFilter !== 'all' ? { key: 'channel', label: channelFilter } : null,
    groupFilter !== 'all' ? { key: 'group', label: groupFilter } : null,
  ].filter(Boolean)
  const hasAnyFilter = statusFilter !== 'active' || activeAdvancedFilters.length > 0
  const resetAllFilters = () => {
    setStatusFilter('active')
    setGroupFilter('all')
    setTitleTagFilter('all')
    setChannelFilter('all')
  }
  const clearAdvancedFilters = () => {
    setGroupFilter('all')
    setTitleTagFilter('all')
    setChannelFilter('all')
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[73] bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={SHEET_TRANSITION} onClick={(event) => event.stopPropagation()} style={BOTTOM_SHEET_MAX_HEIGHT_STYLE} className="absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-3xl flex-col rounded-t-[24px] bg-[var(--surface)] shadow-2xl">
          <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] p-4">
            <div>
              <p className="text-[12px] font-bold" style={{ color: 'var(--promo)' }}>促銷專區</p>
              <h3 className="mt-0.5 text-[20px] font-black text-[var(--text)]">促銷檔期檢視</h3>
              <p className="mt-1 text-[12px] font-bold text-[var(--muted)]">狀態外顯，檔期、通路與品類收進篩選器</p>
            </div>
            <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500"><X className="h-5 w-5" /></button>
          </div>

          <div className="shrink-0 border-b border-[var(--border)] p-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['all','active','upcoming','ended'].map((status) => {
                const active = statusFilter === status
                const label = status === 'all' ? '全部' : (PROMO_STATUS_META[status]?.label || status)
                return (
                  <button key={status} onClick={() => setStatusFilter(status)} className={`shrink-0 rounded-full border font-bold transition ${active ? 'text-white shadow-sm' : 'bg-white text-[var(--muted)]'} ${preset.promoFilter}`} style={active ? { background: 'var(--promo)', borderColor: 'var(--promo)' } : { borderColor: 'var(--border)' }}>
                    {label}
                  </button>
                )
              })}
            </div>

            <div className="mt-2 flex items-center gap-2 rounded-2xl bg-[var(--bg-soft)] p-2">
              <button onClick={openFilterSheet} className="relative flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-2 text-[12px] font-black text-[var(--text)] shadow-sm active:scale-95">
                <SlidersHorizontal className="h-3.5 w-3.5" /> 篩選
                {activeAdvancedFilters.length > 0 && (
                  <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--promo)] px-1.5 text-[10px] text-white">
                    {activeAdvancedFilters.length}
                  </span>
                )}
              </button>

              <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
                {activeAdvancedFilters.length ? activeAdvancedFilters.map((filter) => (
                  <span key={filter.key} className="shrink-0 rounded-full bg-white px-2.5 py-1.5 text-[11px] font-black text-[var(--muted)] shadow-sm">
                    {filter.label}
                  </span>
                )) : (
                  <span className="truncate px-1 text-[11px] font-bold text-[var(--muted)]">可依檔期標籤、促銷通路與品類縮小範圍</span>
                )}
              </div>

              {hasAnyFilter && (
                <button onClick={resetAllFilters} className="shrink-0 rounded-full bg-white px-2.5 py-1.5 text-[11px] font-black text-slate-500 shadow-sm active:scale-95">
                  重設
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pb-[calc(20px+env(safe-area-inset-bottom))]">
            <div className="mb-3 flex items-center justify-between text-[12px] font-bold text-[var(--muted)]">
              <span>目前顯示 {filtered.length} / {items.length} 筆活動</span>
              {activeAdvancedFilters.length > 0 && (
                <button onClick={clearAdvancedFilters} className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">
                  清除細項
                </button>
              )}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {filtered.length ? filtered.map((promo, promoIndex) => {
                const statusMeta = PROMO_STATUS_META[promo.status] || PROMO_STATUS_META.active
                const promoImage = getPromoImage(promo)
                const titleTags = extractPromoTitleTags(promo)
                const channelLabels = getPromoChannelLabels(promo)
                return (
                  <button key={promo.promoId} onClick={() => onOpenPromo(promo)} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white text-left shadow-sm">
                    <div className="relative h-[130px] bg-slate-100 overflow-hidden">
                      {promoImage ? <SafeImage src={promoImage} alt={promo.title} fallbackLabel={promo.title} className="h-full w-full" priority={promoIndex < 2} retryProfile="promo" /> : <div className="flex h-full items-center justify-center text-slate-400"><BadgePercent className="h-9 w-9" /></div>}
                      <div className={`absolute left-2 top-2 rounded-full border font-bold shadow-sm backdrop-blur-sm ${statusMeta.className} ${preset.promoStatus}`}>
                        {statusMeta.label}
                      </div>
                    </div>
                    <div className="space-y-2 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className={`line-clamp-2 font-black leading-tight text-[var(--text)] ${preset.promoTitle}`}>{promo.title}</h4>
                        <span className={`shrink-0 font-bold text-[var(--muted)] ${preset.promoDate}`}>{promo.endDate || promo.startDate}</span>
                      </div>
                      <p className={`line-clamp-3 leading-relaxed text-[var(--muted)] ${preset.promoBody}`}>{promo.content}</p>
                      
                      <div className="flex flex-wrap items-center gap-1.5">
                        {channelLabels.map((channel) => (
                          <span key={channel} className={`flex items-center gap-0.5 rounded bg-slate-100 font-bold text-slate-500 ${preset.promoTag}`}>
                            <Store className={preset.icon} /> {channel}
                          </span>
                        ))}
                        {titleTags.map((tag) => (
                          <span key={tag} className={`rounded-full font-bold ${preset.promoTag}`} style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                            #{tag}
                          </span>
                        ))}
                        {getPromoGroups(promo).map((group) => (
                          <span key={group} className={`rounded-full font-bold ${preset.promoTag}`} style={{ background: 'var(--promo-soft)', color: 'var(--promo)' }}>
                            {group}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                )
              }) : <div className="col-span-full py-10 text-center text-sm text-[var(--muted)]">沒有符合條件的促銷活動</div>}
            </div>
          </div>

          <AnimatePresence>
            {filterSheetOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[76] bg-black/35 backdrop-blur-[2px]" onClick={closeFilterSheet}>
                <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={SHEET_TRANSITION} onClick={(event) => event.stopPropagation()} className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[82vh] w-full max-w-3xl flex-col rounded-t-[24px] bg-white shadow-2xl">
                  <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] p-4">
                    <div>
                      <h4 className="text-[18px] font-black text-[var(--text)]">進階篩選</h4>
                      <p className="mt-1 text-[12px] font-bold text-[var(--muted)]">檔期標籤由活動標題自動判讀；通路獨立判斷</p>
                    </div>
                    <button onClick={closeFilterSheet} className="rounded-full bg-slate-100 p-2 text-slate-500"><X className="h-5 w-5" /></button>
                  </div>

                  <div className="flex-1 space-y-5 overflow-y-auto p-4 pb-4">
                    <div>
                      <p className="mb-2 text-[12px] font-black text-[var(--muted)]">檔期標籤</p>
                      <div className="flex flex-wrap gap-2">
                        {availableTitleTags.map((tag) => {
                          const active = titleTagFilter === tag
                          const label = tag === 'all' ? '全部檔期' : tag
                          const count = tag === 'all' ? items.length : (titleTagCounts.get(tag) || 0)
                          return (
                            <button key={tag} onClick={() => setTitleTagFilter(tag)} className={`rounded-full border font-bold transition ${active ? 'text-white shadow-sm' : 'bg-white text-[var(--muted)]'} ${preset.promoFilter}`} style={active ? { background: 'var(--primary)', borderColor: 'var(--primary)' } : { borderColor: 'var(--border)' }}>
                              {label}<span className="ml-1 opacity-70">{count}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-[12px] font-black text-[var(--muted)]">促銷通路</p>
                      <div className="flex flex-wrap gap-2">
                        {availableChannels.map((channel) => {
                          const active = channelFilter === channel
                          const label = channel === 'all' ? '全部通路' : channel
                          const count = channel === 'all' ? items.length : (channelCounts.get(channel) || 0)
                          return (
                            <button key={channel} onClick={() => setChannelFilter(channel)} className={`rounded-full border font-bold transition ${active ? 'text-white shadow-sm' : 'bg-white text-[var(--muted)]'} ${preset.promoFilter}`} style={active ? { background: '#334155', borderColor: '#334155' } : { borderColor: 'var(--border)' }}>
                              {label}<span className="ml-1 opacity-70">{count}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-[12px] font-black text-[var(--muted)]">品類範圍</p>
                      <div className="flex flex-wrap gap-2">
                        {availableGroups.map((group) => {
                          const active = groupFilter === group
                          const label = group === 'all' ? '全部品類' : group
                          return (
                            <button key={group} onClick={() => setGroupFilter(group)} className={`rounded-full border font-bold transition ${active ? 'text-white shadow-sm' : 'bg-white text-[var(--muted)]'} ${preset.promoFilter}`} style={active ? { background: 'var(--promo)', borderColor: 'var(--promo)' } : { borderColor: 'var(--border)' }}>
                              {label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-[var(--border)] p-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
                    <button onClick={clearAdvancedFilters} className="rounded-2xl border border-[var(--border)] bg-white py-3 text-[13px] font-black text-[var(--muted)] active:scale-95">
                      清除細項
                    </button>
                    <button onClick={closeFilterSheet} className="rounded-2xl py-3 text-[13px] font-black text-white shadow-sm active:scale-95" style={{ background: 'var(--promo)' }}>
                      套用篩選（{filtered.length}）
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
function DataHealthPanel({ open, report, onClose, scale }) {
  if (!open) return null
  const preset = SCALE_PRESETS[scale]
  const statusMeta = report?.status === 'ok'
    ? { label: 'OK', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    : report?.status === 'error'
      ? { label: '需處理', className: 'bg-rose-50 text-rose-700 border-rose-200' }
      : { label: '可檢查', className: 'bg-amber-50 text-amber-700 border-amber-200' }
  const issues = report?.issues || []

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[74] bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={SHEET_TRANSITION} onClick={(event) => event.stopPropagation()} style={BOTTOM_SHEET_MAX_HEIGHT_STYLE} className="absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-3xl flex-col rounded-t-[24px] bg-[var(--surface)] shadow-2xl">
          <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] p-4">
            <div>
              <p className="text-[12px] font-bold" style={{ color: 'var(--primary)' }}>資料健康檢查</p>
              <h3 className="mt-0.5 text-[20px] font-black text-[var(--text)]">Data Health Report</h3>
              <p className="mt-1 text-[12px] font-bold text-[var(--muted)]">此報告由 build 流程產生，僅在 ?diag=1 時讀取。</p>
            </div>
            <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500"><X className="h-5 w-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 pb-[calc(20px+env(safe-area-inset-bottom))]">
            {!report ? (
              <div className="flex items-center justify-center gap-2 py-12 text-[var(--muted)]">
                <RefreshCw className="h-5 w-5 animate-spin" /> 讀取檢查報告中...
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  <div className="rounded-2xl border border-[var(--border)] bg-white p-3">
                    <p className="text-[11px] font-bold text-[var(--muted)]">狀態</p>
                    <p className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[12px] font-black ${statusMeta.className}`}>{statusMeta.label}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--border)] bg-white p-3">
                    <p className="text-[11px] font-bold text-[var(--muted)]">分數</p>
                    <p className="mt-1 text-[22px] font-black text-[var(--primary)]">{report.score}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--border)] bg-white p-3">
                    <p className="text-[11px] font-bold text-[var(--muted)]">可見商品</p>
                    <p className="mt-1 text-[22px] font-black text-[var(--text)]">{report.summary?.visibleProducts}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--border)] bg-white p-3">
                    <p className="text-[11px] font-bold text-[var(--muted)]">促銷活動</p>
                    <p className="mt-1 text-[22px] font-black text-[var(--text)]">{report.summary?.promotions}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--border)] bg-white p-3">
                    <p className="text-[11px] font-bold text-[var(--muted)]">警示</p>
                    <p className="mt-1 text-[22px] font-black text-amber-600">{report.summary?.severityCounts?.warning || 0}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-white p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-black text-[var(--text)]">檢查項目</p>
                    <p className="text-[11px] font-bold text-[var(--muted)]">generatedAt: {report.generatedAt}</p>
                  </div>
                  <div className="mt-3 space-y-2">
                    {issues.length ? issues.map((issue, index) => {
                      const issueClass = issue.severity === 'error'
                        ? 'border-rose-200 bg-rose-50 text-rose-700'
                        : issue.severity === 'warning'
                          ? 'border-amber-200 bg-amber-50 text-amber-700'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      return (
                        <details key={`${issue.area}-${index}`} className={`rounded-xl border p-3 ${issueClass}`}>
                          <summary className={`cursor-pointer font-black ${preset.promoBody}`}>{issue.message} <span className="opacity-70">({issue.count})</span></summary>
                          {issue.samples?.length ? (
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] leading-relaxed">
                              {issue.samples.map((sample) => <li key={sample}>{sample}</li>)}
                            </ul>
                          ) : null}
                        </details>
                      )
                    }) : (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">目前沒有需要處理的資料異常。</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}


// 🚀 全新的報表列印專屬視圖組件
function PrintCatalogView({ products, promotions, timestamp }) {
  // 1. 取得現行有效活動
  const activePromos = useMemo(() => promotions.filter(p => p.status !== 'ended'), [promotions])
  
  // 2. 將所有有活動的商品重新依照 CATEGORY_META 排序與分組
  const allGrouped = useMemo(() => {
    const groups = new Map()
    CATEGORY_META.filter(m => m.key !== 'all' && m.key !== '其他').forEach(m => groups.set(m.key, { ...m, items: [] }))
    groups.set('其他', { key: '其他', label: '其他', items: [] })
    
    products.forEach(p => {
      if (groups.has(p.group)) groups.get(p.group).items.push(p)
      else groups.get('其他').items.push(p)
    })
    return Array.from(groups.values()).filter(g => g.items.length > 0)
  }, [products])

  // 3. 格式化列印觸發當下的時間
  const printDateStr = useMemo(() => {
    const d = timestamp ? new Date(timestamp) : new Date();
    return d.toLocaleString('zh-TW', { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute: '2-digit', second: '2-digit' 
    });
  }, [timestamp]);

  return (
    <div className="print-view bg-white text-black p-4 max-w-none">
      {/* 報表標題與時間 */}
      <div className="text-center mb-6 border-b-2 border-black pb-4">
        <h1 className="text-[28px] font-black mb-1">TTL 台酒生技 - 產品銷售快報</h1>
        <p className="text-[13px] text-gray-600">列印時間：{printDateStr}</p>
      </div>

      {/* 進行中活動區塊 */}
      {activePromos.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[18px] font-bold mb-3 border-b border-gray-400 pb-1 flex justify-between items-end">
            🔥 本期熱門活動 <span className="text-[12px] font-normal text-gray-500">(依列印當下資訊)</span>
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {activePromos.map(promo => (
              <div key={promo.promoId} className="border border-gray-300 p-3 rounded bg-gray-50 break-inside-avoid">
                <div className="font-black text-[15px] mb-1">★ {promo.title}</div>
                <div className="text-[13px] text-gray-800 whitespace-pre-line leading-relaxed mb-2">{promo.content}</div>
                <div className="text-[11px] text-gray-500 italic">期間：{promo.startDate} ~ {promo.endDate}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 全商品表格清單區塊 */}
      <div>
        <h2 className="text-[18px] font-bold mb-3 border-b border-gray-400 pb-1 flex justify-between items-end">
          📦 全產品銷售支援清單 <span className="text-[12px] font-normal text-gray-500">(包含商品話術與對應活動)</span>
        </h2>
        <table className="w-full text-[13px] border-collapse border border-gray-400">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 p-2 text-left w-[10%]">代號</th>
              <th className="border border-gray-400 p-2 text-left w-[18%]">品名</th>
              <th className="border border-gray-400 p-2 text-left w-[42%]">商品主打 / 特色簡介</th>
              <th className="border border-gray-400 p-2 text-left w-[20%]">適用促銷活動</th>
              <th className="border border-gray-400 p-2 text-right w-[10%]">建議售價</th>
            </tr>
          </thead>
          <tbody>
            {allGrouped.map(group => (
              <React.Fragment key={group.key}>
                {/* 分類群組標題列 */}
                <tr>
                  <td colSpan="5" className="bg-gray-100 font-black text-center p-2 border border-gray-400 text-[15px]">
                    {group.label}
                  </td>
                </tr>
                {/* 分類內的商品資料列 */}
                {group.items.map(p => {
                  const promoText = p.promos?.map(pr => `• ${pr.title}`).join('\n') || '';
                  return (
                    <tr key={p.code} className="break-inside-avoid">
                      <td className="border border-gray-400 p-2 align-top font-mono text-[12px]">{p.code}</td>
                      <td className="border border-gray-400 p-2 align-top font-bold">{p.name}</td>
                      <td className="border border-gray-400 p-2 align-top text-gray-700 whitespace-pre-line leading-relaxed">
                        {p.title ? <div className="font-bold text-[14px] text-[var(--primary-strong)] mb-1">【{p.title}】</div> : null}
                        {p.content || <span className="text-gray-400 italic">無簡介資料</span>}
                      </td>
                      <td className="border border-gray-400 p-2 align-top text-[#d81b60] font-bold whitespace-pre-line leading-relaxed">
                        {promoText}
                      </td>
                      <td className="border border-gray-400 p-2 align-top text-right font-black text-[15px]">
                        ${p.price.toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = usePersistentState(STORAGE_KEYS.theme, THEMES[0].key)
  const [scale, setScale] = usePersistentState(STORAGE_KEYS.scale, 'A')
  const [products, setProducts] = useState([])
  const [promotions, setPromotions] = useState([])
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(8)
  const [stage, setStage] = useState('準備啟動系統...')
  const [inputValue, setInputValue] = useState('') 
  const [keyword, setKeyword] = useState('')       
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeTag, setActiveTag] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [promoDrawer, setPromoDrawer] = useState(null)
  const [promoCenterOpen, setPromoCenterOpen] = useState(false)
  const [promoStatusFilter, setPromoStatusFilter] = useState('active')
  const [promoGroupFilter, setPromoGroupFilter] = useState('all')
  const [promoTitleTagFilter, setPromoTitleTagFilter] = useState('all')
  const [promoChannelFilter, setPromoChannelFilter] = useState('all')
  const [dataHealthOpen, setDataHealthOpen] = useState(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('diag') === '1')
  const [dataHealthReport, setDataHealthReport] = useState(null)
  const [tagReturnCode, setTagReturnCode] = useState(null)
  
  const [rankCategory, setRankCategory] = useState('all')
  
  const navRef = useRef(null)

  const expandedCardId = useAppStore((state) => state.expandedCardId)
  const closeExpandedCard = useAppStore((state) => state.closeExpandedCard)
  const activeSection = useAppStore((state) => state.activeSection)
  const setActiveSection = useAppStore((state) => state.setActiveSection)
  const activeModal = useAppStore((state) => state.activeModal)
  const mediaSheetProduct = useAppStore((state) => state.mediaSheetProduct)
  const hydrateSeenVideos = useAppStore((state) => state.hydrateSeenVideos)
  const closeModal = useAppStore((state) => state.closeModal)
  const closeFab = useAppStore((state) => state.closeFab)
  const showToast = useAppStore((state) => state.showToast)
  const setExpandedCardId = useAppStore((state) => state.setExpandedCardId)

  // 🚀 列印觸發的 Timestamp (用以更新報表上的時間)
  const [printTriggerStamp, setPrintTriggerStamp] = useState(null);

  const themeConfig = THEMES.find((item) => item.key === theme) || THEMES[0]

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor && themeConfig) {
        metaThemeColor.setAttribute('content', themeConfig.colors['--primary']);
      }
    }
  }, [themeConfig]);
  
  useViewportCssVar()
  useBodyLock(Boolean(activeModal || promoDrawer || promoCenterOpen || settingsOpen || dataHealthOpen))

  useEffect(() => { hydrateSeenVideos() }, [hydrateSeenVideos])

  useEffect(() => {
    if (!dataHealthOpen || dataHealthReport) return undefined
    let cancelled = false
    fetch(`${BASE_URL}data-health-report.json`, { cache: 'no-store' })
      .then((res) => res.ok ? res.json() : null)
      .then((report) => { if (!cancelled) setDataHealthReport(report) })
      .catch(() => { if (!cancelled) setDataHealthReport({ status: 'error', score: 0, summary: {}, issues: [{ severity: 'error', area: 'system', message: '無法讀取 data-health-report.json', count: 1, samples: [] }] }) })
    return () => { cancelled = true }
  }, [dataHealthOpen, dataHealthReport])
  useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(inputValue)
    }, 300)
    return () => clearTimeout(timer)
  }, [inputValue])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setStage('載入商品主檔...')
        setProgress(20)
        const fetchJson = (file) => fetch(`${BASE_URL}${file}`, { cache: 'no-store' })
        const [mergedRes, promoRes, rankRes] = await Promise.allSettled([
          fetchJson('merged-feed.json'),
          fetchJson('promotions.json'),
          fetchJson('rankings.json')
        ])
        if (cancelled) return
        setProgress(60)

        const mergedJson = mergedRes.status === 'fulfilled' ? await mergedRes.value.json().catch(()=>({})) : {}
        const promoJson = promoRes.status === 'fulfilled' ? await promoRes.value.json().catch(()=>({})) : {}
        const rankJson = rankRes.status === 'fulfilled' ? await rankRes.value.json().catch(()=>({})) : {}

        setProducts(Array.isArray(mergedJson.items) ? mergedJson.items : [])
        setPromotions(Array.isArray(promoJson.items) ? promoJson.items : [])
        setRankings(Array.isArray(rankJson.items) ? rankJson.items : [])
        
        setProgress(100)
        setStage('完成載入')
        window.setTimeout(() => { if (!cancelled) setLoading(false) }, 300)
      } catch (error) {
        setStage('初始化完成 (無外掛資料)')
        setProgress(100)
        window.setTimeout(() => { if (!cancelled) setLoading(false) }, 300)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const normalizedProducts = useMemo(() => {
    const rankMap = new Map(rankings.map((item) => [item.code, item]))
    return products
      .map((item) => {
        const pitch = item.pitch || {}
        const rank = rankMap.get(item.code)
        
        const isHidden = pitch.is_hidden_pp === true || String(pitch.is_hidden_pp).toLowerCase() === 'true' || String(pitch.is_hidden_pp) === '1' ||
                         item.is_hidden_pp === true || String(item.is_hidden_pp).toLowerCase() === 'true' || String(item.is_hidden_pp) === '1'

        return {
          code: item.code,
          name: item.name,
          category: item.category,
          group: normalizeCategory(item.name, item.category), 
          price: Number(item.price || 0),
          photo: item.photo,
          title: pitch.title || '',
          content: pitch.content || '',
          tags: parseTags(pitch.tags),
          isNew: Boolean(pitch.isNew),
          isHidden: isHidden,
          spec: item.spec || '',
          videoUrl: item.videoUrl || '',
          moreLinks: parseMoreLinks(item.moreLinksRaw),
          rank: rank?.rank || null,
        }
      })
      .filter((item) => !item.isHidden)
  }, [products, rankings])

  const productMap = useMemo(() => new Map(normalizedProducts.map((item) => [item.code, item])), [normalizedProducts])

  const enrichedPromotions = useMemo(() => {
    return promotions
      .map((promo) => {
        const chs = []
        if (promo.ch) {
          if (promo.ch.show) chs.push('展售中心')
          if (promo.ch.mart) chs.push('便利店')
          if (promo.ch.eshop) chs.push('購物網')
          if (promo.ch.office) chs.push('營業所')
        }
        
        let channelText = chs.length > 0 
          ? chs.join('、') 
          : (Array.isArray(promo.channelLabels) ? promo.channelLabels.join('、') : '')

        const relatedSet = new Set()
        const rawRules = promo.relatedCodes || []
        
        rawRules.forEach(rawRule => {
          const keywords = String(rawRule).split(/[\s\u3000,，、]+/).filter(Boolean)
          keywords.forEach(kw => {
            if (productMap.has(kw)) {
              relatedSet.add(productMap.get(kw))
            } else {
              normalizedProducts.forEach(p => {
                if (
                  p.group.includes(kw) ||
                  (p.category && p.category.includes(kw)) ||
                  (p.name && p.name.includes(kw)) ||
                  (p.title && p.title.includes(kw)) ||
                  p.tags.some(t => t.includes(kw))
                ) {
                  relatedSet.add(p)
                }
              })
            }
          })
        })

        return {
          ...promo,
          channel: channelText,
          img: getPromoImage(promo),
          relatedProducts: Array.from(relatedSet),
        }
      })
      .sort((a, b) => {
        const aEnd = getPromoDateValue(a.endDate, getPromoDateValue(a.startDate))
        const bEnd = getPromoDateValue(b.endDate, getPromoDateValue(b.startDate))
        if (aEnd !== bEnd) return aEnd - bEnd

        const aStart = getPromoDateValue(a.startDate)
        const bStart = getPromoDateValue(b.startDate)
        return aStart - bStart
      })
  }, [promotions, productMap, normalizedProducts])

  const productsWithPromos = useMemo(() => {
    return normalizedProducts.map((product) => ({
      ...product,
      promos: enrichedPromotions.filter(
        (promo) => promo.status !== 'ended' && promo.relatedProducts.some(rp => rp.code === product.code)
      ),
    }))
  }, [normalizedProducts, enrichedPromotions])

  const parsedKeywords = useMemo(() => {
    return keyword.split(/[\s\u3000,，、]+/).filter(Boolean)
  }, [keyword])

  const filteredProducts = useMemo(() => {
    return productsWithPromos.filter((item) => {
      const tagOk = !activeTag || item.tags.includes(activeTag)
      const haystack = [item.name, item.title, item.content, item.code, ...item.tags].join(' ').toLowerCase()
      const keywordOk = parsedKeywords.length === 0 || parsedKeywords.every(k => haystack.includes(k.toLowerCase()))
      
      return tagOk && keywordOk
    })
  }, [productsWithPromos, parsedKeywords, activeTag])

  const groupedProducts = useMemo(() => {
    const groups = new Map()
    filteredProducts.forEach((item) => {
      if (!groups.has(item.group)) groups.set(item.group, [])
      groups.get(item.group).push(item)
    })
    return CATEGORY_META.filter((meta) => meta.key !== 'all').map((meta) => ({ ...meta, items: groups.get(meta.key) || [] })).filter((item) => item.items.length)
  }, [filteredProducts])

  const allRankedProducts = useMemo(() => {
    const ranked = productsWithPromos.filter(p => p.rank !== null).sort((a, b) => a.rank - b.rank);
    const unranked = productsWithPromos.filter(p => p.rank === null);
    return [...ranked, ...unranked];
  }, [productsWithPromos]);

  const visibleHotProducts = useMemo(() => {
    let list = allRankedProducts;

    if (keyword || activeTag) {
      const codeSet = new Set(filteredProducts.map(item => item.code));
      const matched = list.filter(item => codeSet.has(item.code));
      if (matched.length > 0) list = matched;
    }
    
    if (rankCategory !== 'all') {
      list = list.filter(item => item.group === rankCategory);
    }
    
    return list.slice(0, 10).map((item, index) => ({
      ...item,
      displayRank: index + 1
    }));
  }, [allRankedProducts, filteredProducts, keyword, activeTag, rankCategory]);

  const promoItems = useMemo(() => enrichedPromotions.filter((promo) => promo.status !== 'ended').slice(0, 10), [enrichedPromotions])

  const sectionIds = useMemo(() => ['promo', 'hot', ...CATEGORY_META.filter((item) => item.key !== 'all').map((item) => item.anchor)], [])
  
  useScrollSpy(sectionIds, groupedProducts.length)

  useEffect(() => {
    const button = navRef.current?.querySelector(`[data-anchor="${activeSection}"]`)
    button?.scrollIntoView({ behavior: SCROLL_BEHAVIOR, inline: 'center', block: 'nearest' })
  }, [activeSection])

  useEffect(() => {
    if (!activeSection && !loading) {
      setActiveSection('promo');
    }
  }, [loading, activeSection, setActiveSection]);

  useEffect(() => {
    const handlePopState = (event) => {
      const nextUi = event.state?.ui
      if (activeModal || mediaSheetProduct) { closeModal(); return }
      if (promoDrawer) { setPromoDrawer(null); return }
      if (promoCenterOpen) {
        if (nextUi === 'promo-center') return
        setPromoCenterOpen(false)
        return
      }
      if (settingsOpen) { setSettingsOpen(false); return }
      if (activeTag || keyword) {
        const restoreCode = tagReturnCode
        setActiveTag('')
        setKeyword('')
        setInputValue('')
        if (restoreCode) {
          setExpandedCardId(restoreCode)
          window.setTimeout(() => {
            const el = document.getElementById(`card-${restoreCode}`)
            if (el) {
              const headerHeight = document.querySelector('header')?.offsetHeight || 140
              const y = el.getBoundingClientRect().top + window.scrollY - headerHeight - 10
              window.scrollTo({ top: y, behavior: SCROLL_BEHAVIOR })
            }
          }, 120)
          setTagReturnCode(null)
        }
        return
      }
      if (expandedCardId) { closeExpandedCard(); return }
      closeFab()
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [activeModal, mediaSheetProduct, promoDrawer, promoCenterOpen, settingsOpen, expandedCardId, activeTag, keyword, tagReturnCode, closeExpandedCard, closeFab, closeModal, setExpandedCardId])

  const scrollToId = useCallback((id) => {
    const el = document.getElementById(id)
    if (el) {
      const headerHeight = document.querySelector('header')?.offsetHeight || 140
      const y = el.getBoundingClientRect().top + window.scrollY - headerHeight - 10
      window.scrollTo({ top: y, behavior: SCROLL_BEHAVIOR })
    }
  }, [])

  const clearFilters = useCallback(() => {
    setInputValue('')
    setKeyword('')
    setActiveTag('')
    setTagReturnCode(null)
  }, [])

  const applyTagFilter = useCallback((code, tag) => {
    setTagReturnCode(code)
    setActiveTag(tag)
    setInputValue('')
    setKeyword('')
    setExpandedCardId(code)
    showToast(`已套用標籤：#${tag}`)
    if (typeof window !== 'undefined') window.history.pushState({ ui: 'tag-filter', code, tag }, '')
    window.setTimeout(() => {
      const el = document.getElementById(`card-${code}`)
      if (el) {
        const headerHeight = document.querySelector('header')?.offsetHeight || 140
        const y = el.getBoundingClientRect().top + window.scrollY - headerHeight - 10
        window.scrollTo({ top: y, behavior: SCROLL_BEHAVIOR })
      }
    }, 120)
  }, [setExpandedCardId, showToast])

  const openProductByCode = useCallback((code) => {
    setExpandedCardId(code)
    if (typeof window !== 'undefined') window.history.pushState({ ui: 'card', code }, '')
    window.setTimeout(() => {
      const el = document.getElementById(`card-${code}`)
      if (el) {
        const headerHeight = document.querySelector('header')?.offsetHeight || 140
        const y = el.getBoundingClientRect().top + window.scrollY - headerHeight - 10
        window.scrollTo({ top: y, behavior: SCROLL_BEHAVIOR })
      }
    }, 280) 
  }, [setExpandedCardId])

  const handleOpenFromGlobal = useCallback((code) => {
    clearFilters();
    openProductByCode(code);
  }, [clearFilters, openProductByCode]);

  const navigateToProductFromPromo = useCallback((code) => {
    let steps = 0;
    if (promoDrawer) steps++;
    if (promoCenterOpen) steps++;
    
    if (steps > 0 && typeof window !== 'undefined') {
      window.history.go(-steps);
    }
    
    setPromoDrawer(null);
    setPromoCenterOpen(false);
    clearFilters(); 
    
    setTimeout(() => {
      openProductByCode(code);
    }, 350);
  }, [promoDrawer, promoCenterOpen, clearFilters, openProductByCode]);

  // 🚀 觸發列印功能：寫入時間戳並呼叫 print
  const handlePrintClick = useCallback(() => {
    setPrintTriggerStamp(Date.now());
    setTimeout(() => {
      window.print();
    }, 150); // 給 React 一點時間完成時間戳的 Render
  }, []);

  return (
    <div style={themeConfig.colors} className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans antialiased">
      <style>{`
        html, body, #root { min-height: 100%; background: var(--bg); }
        html { height: 100%; }
        body { margin: 0; padding: 0; min-height: var(--app-height, 100vh); overscroll-behavior-y: contain; transition: background-color 0.3s ease; }
        ${needsConservativeMode ? 'html, body { scroll-behavior: auto !important; }' : ''}
        .promo-balloon { animation: pulseGlow 2s infinite; }
        @keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(249,115,22,0.7); } 70% { box-shadow: 0 0 0 10px rgba(249,115,22,0); } 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0); } }
        *::-webkit-scrollbar { display: none; }
        
        /* 🚀 專門給報表列印用的 CSS 隔離設定 */
        .print-view { display: none; }
        @media print {
          body, html { background: #ffffff !important; color: #000000 !important; margin: 0 !important; padding: 0 !important; }
          .screen-view { display: none !important; }
          .print-view { display: block !important; width: 100% !important; max-width: 100% !important; }
          @page { margin: 1cm; size: A4 portrait; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      {/* 🚀 一般螢幕顯示區塊：加上 .screen-view 確保列印時被隱藏 */}
      <div className="screen-view">
        {loading && <LoaderOverlay progress={progress} stage={stage} />}
        <InstallPrompt />

        <div className="mx-auto max-w-4xl pb-[calc(100px+env(safe-area-inset-bottom))]">
          <header className="sticky top-0 z-30 bg-white/90 px-4 pb-2 pt-[calc(1rem+env(safe-area-inset-top))] shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="text-center w-full flex-1">
                <h1 className="text-[20px] font-black leading-none text-[var(--primary)]">TTL Bio-Tech 健康美學</h1>
                <p className="mt-1 text-[11px] font-bold text-[var(--muted)]">台酒生技 商品與促銷查閱</p>
              </div>
              <button onClick={handlePrintClick} className="absolute right-4 flex h-[34px] w-[34px] items-center justify-center rounded-full border border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)] transition active:scale-95 shadow-sm">
                <Printer className="h-[18px] w-[18px]" />
              </button>
            </div>

            <div className="mx-auto mt-3 w-full max-w-[600px] relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                placeholder="搜尋產品名稱、關鍵字..." 
                className="h-[44px] w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-10 text-[15px] font-bold text-slate-700 outline-none focus:border-[var(--primary)] focus:bg-white focus:ring-2 focus:ring-[var(--primary-soft)] transition"
              />
              {(inputValue || activeTag) && (
                <button onClick={clearFilters} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-200 p-1 text-slate-500 hover:bg-slate-300">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {activeTag ? <div className="mt-2 flex items-center gap-2 px-1"><span className="rounded-full px-3 py-1 text-[11px] font-bold" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>#{activeTag}</span><button onClick={clearFilters} className="text-[11px] font-bold text-[var(--muted)] underline underline-offset-2">返回全部</button></div> : null}
            <div ref={navRef} className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {[{ label: '全部', anchor: 'promo' }, ...CATEGORY_META.filter((item) => item.key !== 'all').map((item) => ({ label: item.label, anchor: item.anchor, category: item.key }))].map((item) => {
                const active = activeSection === item.anchor || (!activeSection && item.anchor === 'promo')
                return (
                  <button
                    key={item.anchor}
                    data-anchor={item.anchor}
                    onClick={() => scrollToId(item.anchor)}
                    className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[14px] font-bold transition ${active ? 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/30' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </header>

          <main className="px-4 pt-4 space-y-6">
            <PromoCarousel
              items={promoItems}
              onOpenPromo={(promo) => { setPromoDrawer(promo); window.history.pushState({ ui: 'promo', promoId: promo.promoId }, '') }}
              onOpenCenter={() => { setPromoCenterOpen(true); window.history.pushState({ ui: 'promo-center' }, '') }}
              scale={scale}
            />
            
            <RankingCarousel 
              items={visibleHotProducts} 
              onOpenProduct={handleOpenFromGlobal} 
              subtitle={keyword || activeTag ? '已依目前篩選條件保留相關熱銷品' : '依實際銷售數據更新'} 
              category={rankCategory}
              setCategory={setRankCategory}
            />

            {groupedProducts.length > 0 ? groupedProducts.map((group, groupIndex) => (
              <section key={group.key} id={group.anchor} data-spy-section className={`scroll-mt-[185px]`}>
                <SectionTitle title={group.label} subtitle="" />
                <div className="space-y-3">
                  {group.items.map((product, productIndex) => (
                    <div id={`card-${product.code}`} key={product.code}>
                      <ProductRow 
                        product={product} 
                        scale={scale} 
                        keyword={parsedKeywords} 
                        onOpenProductByCode={openProductByCode} 
                        onApplyTagFilter={applyTagFilter} 
                        onOpenPromo={(promo) => { setPromoDrawer(promo); window.history.pushState({ ui: 'promo', promoId: promo.promoId }, '') }}
                        priority={groupIndex === 0 && productIndex < 3}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )) : (
              <div className="py-20 text-center">
                <Search className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <p className="text-[16px] font-bold text-slate-500">沒有符合條件的商品</p>
              </div>
            )}
          </main>

          <p className="px-4 pb-2 pt-4 text-center text-xs text-slate-500">
            本系統內容供內部業務支援參考，實際資訊仍以正式公告資料為準。
          </p>
        </div>

        <SettingsPanel 
          open={settingsOpen} 
          onClose={() => { if (window.history.state?.ui === 'settings') window.history.back(); else setSettingsOpen(false); }} 
          theme={theme} setTheme={setTheme} scale={scale} setScale={setScale} 
        />
        <MediaSheet />
        <VideoModal />
        <LightboxModal />
        <PromoCenterPanel 
          open={promoCenterOpen} 
          items={enrichedPromotions} 
          statusFilter={promoStatusFilter} 
          setStatusFilter={setPromoStatusFilter} 
          groupFilter={promoGroupFilter} 
          setGroupFilter={setPromoGroupFilter} 
          titleTagFilter={promoTitleTagFilter} 
          setTitleTagFilter={setPromoTitleTagFilter} 
          channelFilter={promoChannelFilter} 
          setChannelFilter={setPromoChannelFilter} 
          onOpenPromo={(promo) => { setPromoDrawer(promo); window.history.pushState({ ui: 'promo', promoId: promo.promoId }, '') }} 
          onClose={() => { if (window.history.state?.ui === 'promo-center') window.history.back(); else setPromoCenterOpen(false); }} 
          scale={scale}
        />
        <PromoDrawer 
          promo={promoDrawer} 
          onClose={() => { if (window.history.state?.ui === 'promo') window.history.back(); else setPromoDrawer(null); }} 
          onNavigateToProduct={navigateToProductFromPromo}
          scale={scale}
        />
        <FabMenu onScrollTop={() => window.scrollTo({ top: 0, behavior: SCROLL_BEHAVIOR })} onGotoPromo={() => { setPromoCenterOpen(true); window.history.pushState({ ui: 'promo-center' }, '') }} onToggleSettings={() => { setSettingsOpen(true); window.history.pushState({ ui: 'settings' }, '') }} onGotoSection={scrollToId} />
        <DataHealthPanel open={dataHealthOpen} report={dataHealthReport} onClose={() => setDataHealthOpen(false)} scale={scale} />
        <ToastMessage />
      </div>

      {/* 🚀 隱藏的列印報表視圖 */}
      <PrintCatalogView 
        products={productsWithPromos} 
        promotions={enrichedPromotions} 
        timestamp={printTriggerStamp} 
      />
    </div>
  )
}
