import { ICON_KEYS, type IconKey } from '@/consts/icons';

export function includesIconKey(icon: string): icon is IconKey {
  return (ICON_KEYS as string[]).includes(icon);
}

export function filterIconKeys(icons: string[]): IconKey[] {
  return icons.filter(includesIconKey);
}
