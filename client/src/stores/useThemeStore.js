import { create } from 'zustand';

/* Read initial theme from localStorage or system preference */
function getInitialTheme() {
  const stored = localStorage.getItem('thejobstarter-theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const useThemeStore = create((set) => ({
  theme: getInitialTheme(),

  toggleTheme: () => {
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('thejobstarter-theme', next);
      document.documentElement.setAttribute('data-theme', next);
      return { theme: next };
    });
  },

  initTheme: () => {
    const theme = getInitialTheme();
    document.documentElement.setAttribute('data-theme', theme);
    return theme;
  }
}));
