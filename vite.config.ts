import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'
import react from '@vitejs/plugin-react'
import importToCDN from "vite-plugin-cdn-import"

export default defineConfig({
  plugins: [
    react(),
    importToCDN({
      // 为 react 和 react-dom 添加 CDN 引入
      modules: [
        { name: 'react', var: 'React', path: 'umd/react.production.min.js' },
        { name: 'react-dom', var: 'ReactDOM', path: 'umd/react-dom.production.min.js' },
        // autoComplete('react'),
        // autoComplete('react-dom')
      ]
    }),
    // 生产环境构建时启用分析
    process.env.ANALYZE === 'true' &&
      visualizer({
        open: true, // 构建完成后自动打开报告页面
        filename: 'dist/stats.html', // 报告生成路径
        gzipSize: true, // 分析 gzip 压缩后的体积
        brotliSize: true, // 分析 brotli 压缩后的体积
      }),
  ].filter(Boolean),
  server: {
    port: 5173,
    open: true
  },
  base: "./",
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
})
