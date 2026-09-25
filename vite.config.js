import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  // Keep local development at /; production is a GitHub project site.
  base: command === 'build' ? '/persona-lab/' : '/',
}));
