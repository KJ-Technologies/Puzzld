import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const frontendDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.join(frontendDir, 'src'),
  publicDir: path.join(frontendDir, 'public'),
  envDir: frontendDir,
  plugins: [react()],
  build: {
    outDir: path.join(frontendDir, 'dist'),
    assetsDir: 'assets',
    emptyOutDir: true,
  }
});
