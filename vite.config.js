import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // GitHub Pages 배포 시 레포지토리 이름이 경로에 포함되므로 상대 경로로 설정
    base: './',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
    },
    server: {
        port: 3000,
        open: true
    }
})
