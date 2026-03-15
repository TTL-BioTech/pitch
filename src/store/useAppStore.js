
import { create } from 'zustand'

const STORAGE_KEYS = {
  seenVideos: 'ttl-react-seen-videos-v7',
}

function readSeenVideos() {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEYS.seenVideos) || '{}')
  } catch {
    return {}
  }
}

function writeSeenVideos(value) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEYS.seenVideos, JSON.stringify(value))
  } catch {}
}

export const useAppStore = create((set, get) => ({
  expandedCardId: null,
  activeSection: 'promo',
  activeModal: null,
  seenVideos: {},
  lightbox: null,
  videoPayload: null,
  mediaSheetProduct: null,
  fabOpen: false,
  toast: null,

  hydrateSeenVideos: () => set({ seenVideos: readSeenVideos() }),

  setExpandedCardId: (cardId) =>
    set((state) => ({
      expandedCardId: state.expandedCardId === cardId ? null : cardId,
    })),

  closeExpandedCard: () => set({ expandedCardId: null }),

  setActiveSection: (sectionId) => set({ activeSection: sectionId }),

  openLightbox: (payload) => set({ activeModal: 'lightbox', lightbox: payload }),
  openVideo: (payload) => set({ activeModal: 'video', videoPayload: payload }),
  openMediaSheet: (product) => set({ activeModal: 'sheet', mediaSheetProduct: product }),

  closeModal: () =>
    set({
      activeModal: null,
      lightbox: null,
      videoPayload: null,
      mediaSheetProduct: null,
    }),

  markVideoSeen: (code, videoUrl = '') => {
    const next = {
      ...get().seenVideos,
      [code]: videoUrl || new Date().toISOString(),
    }
    writeSeenVideos(next)
    set({ seenVideos: next })
  },

  toggleFab: () => set((state) => ({ fabOpen: !state.fabOpen })),
  closeFab: () => set({ fabOpen: false }),

  showToast: (message) => {
    const id = Date.now()
    set({ toast: { id, message } })
    return id
  },

  clearToast: (id) => {
    const current = get().toast
    if (!current || (id && current.id !== id)) return
    set({ toast: null })
  },
}))
