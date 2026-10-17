import { Injectable, signal, effect } from '@angular/core';

export type BookTheme = 'parchment' | 'midnight' | 'forest' | 'sepia';

export interface ThemeOption {
  id: BookTheme;
  name: string;
  icon: string;
  coverBg: string;
  pageBgLeft: string;
  pageBgRight: string;
  textColor: string;
  accentColor: string;
  deskBg: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'qa_book_selected_theme';

  readonly themes: ThemeOption[] = [
    {
      id: 'parchment',
      name: 'Antique Parchment',
      icon: '📜',
      coverBg: '#2a1a15',
      pageBgLeft: '#fdfaf3',
      pageBgRight: '#faf5ea',
      textColor: '#1c1917',
      accentColor: '#d97706',
      deskBg: '#191310'
    },
    {
      id: 'midnight',
      name: 'Midnight Scholar',
      icon: '🌙',
      coverBg: '#0f172a',
      pageBgLeft: '#1e293b',
      pageBgRight: '#182234',
      textColor: '#f1f5f9',
      accentColor: '#38bdf8',
      deskBg: '#090d16'
    },
    {
      id: 'forest',
      name: 'Emerald Codex',
      icon: '🌿',
      coverBg: '#062817',
      pageBgLeft: '#fbfdf9',
      pageBgRight: '#f4f9f1',
      textColor: '#0f291e',
      accentColor: '#059669',
      deskBg: '#03140b'
    },
    {
      id: 'sepia',
      name: 'Warm Coffee',
      icon: '☕',
      coverBg: '#36221a',
      pageBgLeft: '#fbf6ee',
      pageBgRight: '#f5ecd9',
      textColor: '#29180f',
      accentColor: '#c2410c',
      deskBg: '#1c100b'
    }
  ];

  readonly currentTheme = signal<BookTheme>(this.getStoredTheme());

  constructor() {
    effect(() => {
      const theme = this.currentTheme();
      localStorage.setItem(this.STORAGE_KEY, theme);
    });
  }

  setTheme(theme: BookTheme): void {
    this.currentTheme.set(theme);
  }

  getThemeConfig(): ThemeOption {
    return this.themes.find(t => t.id === this.currentTheme()) || this.themes[0];
  }

  private getStoredTheme(): BookTheme {
    const stored = localStorage.getItem(this.STORAGE_KEY) as BookTheme;
    if (stored && this.themes.some(t => t.id === stored)) {
      return stored;
    }
    return 'parchment';
  }
}
