import { TanStackRouterRspack } from '@tanstack/router-plugin/rspack';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

const isTest = process.env.NODE_ENV === 'test';

export default defineConfig({
  plugins: [pluginReact()],
  dev: {
    assetPrefix: 'http://localhost:3010/',
  },
  server: {
    port: 3010,
  },
  tools: {
    rspack: {
      plugins: [
        !isTest &&
          TanStackRouterRspack({
            autoCodeSplitting: true,
          }),
        new ModuleFederationPlugin({
          name: 'example-app',
          experiments: {
            federationRuntime: 'hoisted',
          },
          shared: {
            'react': { singleton: true },
            'react-dom': { singleton: true },
            '@tanstack/react-router': { singleton: true },
          }
        }),
      ],
    },
  },
});
