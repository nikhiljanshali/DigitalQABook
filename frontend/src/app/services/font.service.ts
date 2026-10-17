import { Injectable, effect, signal } from '@angular/core';

export type AppFont = 'merriweather' | 'inter' | 'lora' | 'playfair' | 'firacode';

export interface FontOption {
  id: AppFont;
  name: string;
  fontFamily: string;
  icon: string;
  category: 'Serif' | 'Sans' | 'Monospace';
}

@Injectable({
  providedIn: 'root'
})
export class FontService {
  private readonly STORAGE_KEY = 'qa_book_selected_font';

  readonly fonts: FontOption[] = [
    {
      id: 'merriweather',
      name: 'Merriweather (Classic Serif)',
      fontFamily: "'Merriweather', Georgia, serif",
      icon: '📖',
      category: 'Serif'
    },
    {
      id: 'inter',
      name: 'Inter (Modern Sans)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      icon: '⚡',
      category: 'Sans'
    },
    {
      id: 'lora',
      name: 'Lora (Literary Book)',
      fontFamily: "'Lora', Georgia, 'Times New Roman', serif",
      icon: '📜',
      category: 'Serif'
    },
    {
      id: 'playfair',
      name: 'Playfair (Editorial Display)',
      fontFamily: "'Playfair Display', Georgia, serif",
      icon: '🏛️',
      category: 'Serif'
    },
    {
      id: 'firacode',
      name: 'Fira Code (Monospace Tech)',
      fontFamily: "'Fira Code', 'Courier New', monospace",
      icon: '💻',
      category: 'Monospace'
    }
  ];

  readonly currentFont = signal<AppFont>(this.getStoredFont());

  constructor() {
    // Dynamically apply font family to entire document whenever signal changes
    effect(() => {
      const fontId = this.currentFont();
      const option = this.fonts.find(f => f.id === fontId) || this.fonts[0];
      
      localStorage.setItem(this.STORAGE_KEY, fontId);
      
      if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--app-font-family', option.fontFamily);
        document.body.style.fontFamily = option.fontFamily;
      }
    });
  }

  setFont(font: AppFont): void {
    this.currentFont.set(font);
  }

  getCurrentFontOption(): FontOption {
    return this.fonts.find(f => f.id === this.currentFont()) || this.fonts[0];
  }

  private getStoredFont(): AppFont {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(this.STORAGE_KEY) as AppFont;
      if (stored && this.fonts.some(f => f.id === stored)) {
        return stored;
      }
    }
    return 'merriweather';
  }
}
