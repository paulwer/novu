import { type Options, defineConfig } from 'tsup';
import { version } from './package.json';
import { type SupportedFrameworkName } from './src/internal';

const frameworks: SupportedFrameworkName[] = ['h3', 'express', 'next', 'nuxt', 'sveltekit', 'remix', 'lambda', 'nest'];

const baseConfig: Options = {
  entry: ['src/index.ts', 'src/internal/index.ts', ...frameworks.map((framework) => `src/servers/${framework}.ts`)],
  sourcemap: false,
  clean: true,
  dts: true,
  minify: true,
  minifyWhitespace: true,
  minifyIdentifiers: true,
  minifySyntax: true,
  define: {
    SDK_VERSION: `"${version}"`,
    FRAMEWORK_VERSION: `"2024-06-26"`,
  },
};

export default defineConfig([
  {
    ...baseConfig,
    format: 'cjs',
    outDir: 'dist/cjs',
  },
  {
    ...baseConfig,
    format: 'esm',
    outDir: 'dist/esm',
  },
]);
