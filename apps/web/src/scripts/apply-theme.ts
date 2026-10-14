function applyTheme() {
  const c = document.cookie;
  const i = c.indexOf('theme=');
  const theme = i >= 0 ? c.slice(i + 6).split(';')[0] : null;
  if (theme === 'dark' || theme === 'light') {
    document.documentElement.classList.add(theme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  }
}

applyTheme();
