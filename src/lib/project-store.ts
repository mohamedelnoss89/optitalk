'use client';

import { create } from 'zustand';

// ============== Supported Formats ==============
export const SUPPORTED_VIDEO_FORMATS = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv', '.3gp', '.m4v', '.mpeg', '.mpg', '.ogv'];
export const SUPPORTED_AUDIO_FORMATS = ['.mp3', '.wav', '.aac', '.m4a', '.ogg', '.flac', '.wma', '.opus', '.aiff'];
export const SUPPORTED_IMAGE_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.avif'];

export const VIDEO_ACCEPT = 'video/*,.mp4,.mov,.avi,.mkv,.webm,.flv,.wmv,.3gp,.m4v,.mpeg,.mpg,.ogv';
export const AUDIO_ACCEPT = 'audio/*,.mp3,.wav,.aac,.m4a,.ogg,.flac,.wma,.opus,.aiff';
export const IMAGE_ACCEPT = 'image/*,.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg,.avif';

// ============== Types ==============
export type ClipType = 'video' | 'image';

export interface VideoClip {
  id: string;
  type: ClipType;
  file: File;
  url: string;
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
  width: number;
  height: number;
  thumbnail?: string;
  thumbnails?: string[];
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  speed: number;
  imageDuration?: number;
  // Audio per-clip
  volume: number; // 0 to 1 (default 1)
  muted: boolean;
  fadeIn: number; // seconds (default 0)
  fadeOut: number; // seconds (default 0)
}

export interface TextOverlay {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
}

export interface AudioTrack {
  id: string;
  file: File;
  url: string;
  name: string;
  duration: number;
  volume: number;
  videoOffset: number;
}

export interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
}

export type TransitionType = 'fade' | 'slide' | 'zoom' | 'wipe' | 'dissolve' | 'push';

export interface Transition {
  id: string;
  type: TransitionType;
  duration: number;
  afterClipIndex: number;
}

export interface EffectPreset {
  id: string;
  name: string;
  cssFilter: string;
  brightness: number;
  contrast: number;
  saturation: number;
}

export const EFFECT_PRESETS: EffectPreset[] = [
  { id: 'original', name: 'Original', cssFilter: 'none', brightness: 0, contrast: 1, saturation: 1 },
  { id: 'vintage', name: 'Vintage', cssFilter: 'sepia(0.4) contrast(1.1) brightness(0.95)', brightness: -0.05, contrast: 1.1, saturation: 1.3 },
  { id: 'cool', name: 'Cool', cssFilter: 'hue-rotate(180deg) saturate(1.2)', brightness: 0.05, contrast: 1, saturation: 0.8 },
  { id: 'warm', name: 'Warm', cssFilter: 'sepia(0.2) saturate(1.4) brightness(1.05)', brightness: 0.1, contrast: 1, saturation: 1.3 },
  { id: 'bw', name: 'B&W', cssFilter: 'grayscale(1)', brightness: 0, contrast: 1.2, saturation: 0 },
  { id: 'vivid', name: 'Vivid', cssFilter: 'saturate(1.6) contrast(1.2)', brightness: 0.1, contrast: 1.3, saturation: 1.5 },
  { id: 'sepia', name: 'Sepia', cssFilter: 'sepia(1)', brightness: 0, contrast: 1, saturation: 1 },
  { id: 'noir', name: 'Noir', cssFilter: 'grayscale(1) contrast(1.4) brightness(0.9)', brightness: -0.1, contrast: 1.4, saturation: 0 },
];

export interface TextTemplate {
  id: string;
  name: string;
  text: string;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  y: number;
}

export const TEXT_TEMPLATES: TextTemplate[] = [
  { id: 'title', name: 'عنوان كبير', text: 'عنوان', fontSize: 48, color: '#ffffff', bold: true, italic: false, y: 0.15 },
  { id: 'subtitle', name: 'عنوان فرعي', text: 'عنوان فرعي', fontSize: 24, color: '#e2e8f0', bold: false, italic: false, y: 0.25 },
  { id: 'highlight', name: 'نص بارز', text: 'بارز', fontSize: 32, color: '#fbbf24', bold: true, italic: false, y: 0.5 },
  { id: 'caption', name: 'نص أسفل', text: 'نص أسفل الشاشة', fontSize: 18, color: '#ffffff', bold: false, italic: false, y: 0.85 },
  { id: 'lower-third', name: 'شريط أسفل', text: 'اسم / عنوان', fontSize: 22, color: '#ffffff', bold: true, italic: false, y: 0.8 },
  { id: 'quote', name: 'اقتباس', text: 'اقتباس', fontSize: 28, color: '#a78bfa', bold: false, italic: true, y: 0.5 },
];

// Stickers - ميزة جديدة
export interface Sticker {
  id: string;
  emoji: string;
  name: string;
}

export const STICKERS: Sticker[] = [
  { id: 's1', emoji: '😀', name: 'فرحان' },
  { id: 's2', emoji: '😍', name: 'حب' },
  { id: 's3', emoji: '😎', name: 'كول' },
  { id: 's4', emoji: '🤔', name: 'تفكير' },
  { id: 's5', emoji: '😂', name: 'ضحك' },
  { id: 's6', emoji: '🎉', name: 'احتفال' },
  { id: 's7', emoji: '❤️', name: 'قلب' },
  { id: 's8', emoji: '⭐', name: 'نجمة' },
  { id: 's9', emoji: '🔥', name: 'نار' },
  { id: 's10', emoji: '👍', name: 'إعجاب' },
  { id: 's11', emoji: '🎬', name: 'فيلم' },
  { id: 's12', emoji: '🎵', name: 'موسيقى' },
  { id: 's13', emoji: '✨', name: 'لمعان' },
  { id: 's14', emoji: '💥', name: 'انفجار' },
  { id: 's15', emoji: '🌟', name: 'تألق' },
  { id: 's16', emoji: '💯', name: 'ممتاز' },
];

export interface StickerOverlay {
  id: string;
  emoji: string;
  startTime: number;
  endTime: number;
  x: number;
  y: number;
  size: number;
}

// ============== Store ==============
interface ProjectState {
  projectName: string;
  setProjectName: (name: string) => void;

  clips: VideoClip[];
  addClip: (clip: VideoClip) => void;
  removeClip: (id: string) => void;
  updateClip: (id: string, updates: Partial<VideoClip>) => void;
  reorderClips: (clips: VideoClip[]) => void;
  // Split the clip at the given global time (creates 2 clips)
  splitClipAtTime: (clipId: string, localTime: number) => void;
  // Duplicate a clip
  duplicateClip: (clipId: string) => void;
  // Move clip from one index to another
  moveClip: (fromIndex: number, toIndex: number) => void;

  selectedClipId: string | null;
  setSelectedClipId: (id: string | null) => void;

  globalTime: number;
  setGlobalTime: (time: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;

  texts: TextOverlay[];
  addText: (text: TextOverlay) => void;
  removeText: (id: string) => void;
  updateText: (id: string, updates: Partial<TextOverlay>) => void;

  stickers: StickerOverlay[];
  addSticker: (sticker: StickerOverlay) => void;
  removeSticker: (id: string) => void;

  audioTrack: AudioTrack | null;
  setAudioTrack: (audio: AudioTrack | null) => void;

  filters: FilterSettings;
  setFilters: (filters: FilterSettings) => void;
  resetFilters: () => void;

  transitions: Transition[];
  addTransition: (transition: Transition) => void;
  removeTransition: (id: string) => void;
  updateTransition: (id: string, updates: Partial<Transition>) => void;

  // Media Bin - imported files that haven't been added to timeline yet
  mediaBin: VideoClip[];
  addToMediaBin: (clip: VideoClip) => void;
  removeFromMediaBin: (id: string) => void;
  // Move from media bin to timeline (clips)
  addFromMediaBin: (clipId: string) => void;

  getTotalDuration: () => number;
  reset: () => void;
}

const defaultFilters: FilterSettings = { brightness: 0, contrast: 1, saturation: 1 };

export const useProjectStore = create<ProjectState>((set, get) => ({
  projectName: 'مشروع جديد',
  setProjectName: (name) => set({ projectName: name }),

  clips: [],
  addClip: (clip) => set((state) => ({ clips: [...state.clips, clip] })),
  removeClip: (id) =>
    set((state) => {
      const clip = state.clips.find((c) => c.id === id);
      if (clip) {
        // نتأكد إن مفيش clip تاني (في clips أو mediaBin) بيستخدم نفس الـ URL
        const stillUsed =
          state.clips.some((c) => c.id !== id && c.url === clip.url) ||
          state.mediaBin.some((c) => c.url === clip.url);
        if (!stillUsed) URL.revokeObjectURL(clip.url);
      }
      const newClips = state.clips.filter((c) => c.id !== id);
      return {
        clips: newClips,
        selectedClipId: state.selectedClipId === id ? (newClips[0]?.id ?? null) : state.selectedClipId,
      };
    }),
  updateClip: (id, updates) =>
    set((state) => ({ clips: state.clips.map((c) => (c.id === id ? { ...c, ...updates } : c)) })),
  reorderClips: (clips) => set({ clips }),

  // Split clip at local time (localTime is relative to the clip's start in the source video)
  splitClipAtTime: (clipId, localTime) =>
    set((state) => {
      const idx = state.clips.findIndex((c) => c.id === clipId);
      if (idx < 0) return state;
      const original = state.clips[idx];

      // For images: split imageDuration
      if (original.type === 'image') {
        const imgDur = original.imageDuration || 5;
        if (localTime <= 0 || localTime >= imgDur) return state;
        const firstDur = localTime;
        const secondDur = imgDur - localTime;
        const first: VideoClip = { ...original, imageDuration: firstDur, duration: firstDur, startTime: 0, endTime: firstDur };
        const second: VideoClip = { ...original, id: generateId(), imageDuration: secondDur, duration: secondDur, startTime: 0, endTime: secondDur };
        const newClips = [...state.clips];
        newClips.splice(idx, 1, first, second);
        return { clips: newClips, selectedClipId: first.id };
      }

      // For videos: split based on source video time
      // localTime is the time within the clip's playback (already accounting for speed)
      // sourceTime = startTime + localTime * speed
      const sourceSplitTime = original.startTime + localTime * original.speed;
      if (sourceSplitTime <= original.startTime || sourceSplitTime >= original.endTime) return state;

      const firstEnd = sourceSplitTime;
      const secondStart = sourceSplitTime;
      const firstDuration = (firstEnd - original.startTime) / original.speed;
      const secondDuration = (original.endTime - secondStart) / original.speed;

      const first: VideoClip = { ...original, endTime: firstEnd };
      const second: VideoClip = { ...original, id: generateId(), startTime: secondStart, endTime: original.endTime };

      const newClips = [...state.clips];
      newClips.splice(idx, 1, first, second);
      return { clips: newClips, selectedClipId: first.id };
    }),

  duplicateClip: (clipId) =>
    set((state) => {
      const idx = state.clips.findIndex((c) => c.id === clipId);
      if (idx < 0) return state;
      const original = state.clips[idx];
      const copy: VideoClip = { ...original, id: generateId() };
      const newClips = [...state.clips];
      newClips.splice(idx + 1, 0, copy);
      return { clips: newClips, selectedClipId: copy.id };
    }),

  moveClip: (fromIndex, toIndex) =>
    set((state) => {
      if (fromIndex < 0 || fromIndex >= state.clips.length) return state;
      if (toIndex < 0 || toIndex >= state.clips.length) return state;
      const newClips = [...state.clips];
      const [moved] = newClips.splice(fromIndex, 1);
      newClips.splice(toIndex, 0, moved);
      return { clips: newClips };
    }),

  selectedClipId: null,
  setSelectedClipId: (id) => set({ selectedClipId: id }),

  globalTime: 0,
  setGlobalTime: (time) => set({ globalTime: time }),
  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),

  texts: [],
  addText: (text) => set((state) => ({ texts: [...state.texts, text] })),
  removeText: (id) => set((state) => ({ texts: state.texts.filter((t) => t.id !== id) })),
  updateText: (id, updates) =>
    set((state) => ({ texts: state.texts.map((t) => (t.id === id ? { ...t, ...updates } : t)) })),

  stickers: [],
  addSticker: (sticker) => set((state) => ({ stickers: [...state.stickers, sticker] })),
  removeSticker: (id) => set((state) => ({ stickers: state.stickers.filter((s) => s.id !== id) })),

  audioTrack: null,
  setAudioTrack: (audio) =>
    set((state) => {
      if (state.audioTrack) URL.revokeObjectURL(state.audioTrack.url);
      return { audioTrack: audio };
    }),

  filters: defaultFilters,
  setFilters: (filters) => set({ filters }),
  resetFilters: () => set({ filters: defaultFilters }),

  transitions: [],
  addTransition: (transition) => set((state) => ({ transitions: [...state.transitions, transition] })),
  removeTransition: (id) => set((state) => ({ transitions: state.transitions.filter((t) => t.id !== id) })),
  updateTransition: (id, updates) =>
    set((state) => ({ transitions: state.transitions.map((t) => (t.id === id ? { ...t, ...updates } : t)) })),

  // Media Bin
  mediaBin: [],
  addToMediaBin: (clip) => set((state) => ({ mediaBin: [...state.mediaBin, clip] })),
  removeFromMediaBin: (id) =>
    set((state) => {
      const item = state.mediaBin.find((c) => c.id === id);
      if (item) {
        const stillUsed =
          state.clips.some((c) => c.url === item.url) ||
          state.mediaBin.some((c) => c.id !== id && c.url === item.url);
        if (!stillUsed) URL.revokeObjectURL(item.url);
      }
      return { mediaBin: state.mediaBin.filter((c) => c.id !== id) };
    }),
  addFromMediaBin: (clipId) =>
    set((state) => {
      const clip = state.mediaBin.find((c) => c.id === clipId);
      if (!clip) return state;
      return {
        mediaBin: state.mediaBin.filter((c) => c.id !== clipId),
        clips: [...state.clips, clip],
        selectedClipId: clip.id,
      };
    }),

  getTotalDuration: () => {
    const clips = get().clips;
    return clips.reduce((sum, clip) => {
      const duration = clip.type === 'image' ? (clip.imageDuration || 5) : (clip.endTime - clip.startTime) / clip.speed;
      return sum + duration;
    }, 0);
  },

  reset: () => {
    const state = get();
    state.clips.forEach((c) => URL.revokeObjectURL(c.url));
    state.mediaBin.forEach((c) => URL.revokeObjectURL(c.url));
    if (state.audioTrack) URL.revokeObjectURL(state.audioTrack.url);
    set({
      projectName: 'مشروع جديد',
      clips: [],
      mediaBin: [],
      texts: [],
      stickers: [],
      audioTrack: null,
      filters: defaultFilters,
      transitions: [],
      selectedClipId: null,
      globalTime: 0,
      isPlaying: false,
    });
  },
}));

// ============== Helper functions ==============
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function getClipDuration(clip: VideoClip): number {
  if (clip.type === 'image') return clip.imageDuration || 5;
  return (clip.endTime - clip.startTime) / clip.speed;
}

export function getTotalProjectDuration(clips: VideoClip[]): number {
  return clips.reduce((sum, clip) => sum + getClipDuration(clip), 0);
}

export function findClipAtTime(clips: VideoClip[], globalTime: number) {
  if (clips.length === 0) return null;
  let cumulative = 0;
  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];
    const clipDur = getClipDuration(clip);
    if (globalTime < cumulative + clipDur) {
      return { clip, index: i, localTime: globalTime - cumulative, clipStartTime: cumulative };
    }
    cumulative += clipDur;
  }
  const lastClip = clips[clips.length - 1];
  const lastDur = getClipDuration(lastClip);
  return { clip: lastClip, index: clips.length - 1, localTime: lastDur, clipStartTime: cumulative - lastDur };
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/') || /\.(mp4|mov|avi|mkv|webm|flv|wmv|3gp|m4v|mpeg|mpg|ogv)$/i.test(file.name);
}
export function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/') || /\.(mp3|wav|aac|m4a|ogg|flac|wma|opus|aiff)$/i.test(file.name);
}
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp|svg|avif)$/i.test(file.name);
}
