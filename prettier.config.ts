import { type Config } from 'prettier';

const config: Config = {
  plugins: ['prettier-plugin-astro'],
  trailingComma: 'all',
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  printWidth: 80,
  useTabs: false,
};

export default config;
