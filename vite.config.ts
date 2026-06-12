import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/senior-edu-prompt-generator/',
  plugins: [react()],
});
