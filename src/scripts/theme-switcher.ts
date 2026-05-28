const THEME_REGEX = /theme=([^;]+)/;
const themeBtns
  = document.querySelectorAll<HTMLButtonElement>('.theme-btn');
const root = document.documentElement;

function setTheme(theme: string) {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  if (theme === 'system') {
    document.cookie = `theme=; path=/; max-age=0; SameSite=Lax${secure}`;
    root.classList.remove('light', 'dark');
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark');
    }
  } else {
    document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Lax${secure}`;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }
  updateActiveBtn(theme);
}

function updateActiveBtn(theme: string) {
  themeBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

function getStoredTheme(): string {
  const match = document.cookie.match(THEME_REGEX);
  return match ? match[1] : 'system';
}

// Initialize - apply stored theme on load
const storedTheme = getStoredTheme();
setTheme(storedTheme);

themeBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    setTheme(btn.dataset.theme || 'system');
  });
});

// Listen for system preference changes
window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (e) => {
    if (getStoredTheme() === 'system') {
      root.classList.toggle('dark', e.matches);
    }
  });
