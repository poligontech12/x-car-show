import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      /* Existing hydration effects intentionally synchronize persisted UI state. */
      'react-hooks/set-state-in-effect': 'off',
      /* These sources use data URLs and byte-serving routes, not Next image optimization. */
      '@next/next/no-img-element': 'off',
      /* Canonical auth enforcement deliberately replaces an insecure location. */
      '@next/next/no-location-assign-relative-destination': 'off',
      'import/no-anonymous-default-export': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    'coverage/**',
    'design/**',
    'playwright-report/**',
    'test-results/**',
  ]),
]);
