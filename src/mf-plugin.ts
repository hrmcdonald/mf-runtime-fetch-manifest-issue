import type { FederationRuntimePlugin } from '@module-federation/enhanced/runtime';

export const myRuntimePlugin: () => FederationRuntimePlugin = function () {
  return {
    name: 'my-platform-plugin',
    async errorLoadRemote(args) {
      const { id, error, from, origin } = args;
      const getModule = (m: any, from: any) => {
        if (from === 'build') {
          return () => ({
            __esModule: true,
            default: m,
          });
        } else {
          return {
            default: m,
          };
        }
      };

      const reportError = () => {
        console.error(`Remote "${id}" is offline due to error: ${error}`);
      };

      return getModule(reportError, from);
    },
  };
};
