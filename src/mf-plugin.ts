import type { FederationRuntimePlugin } from '@module-federation/enhanced/runtime';

export const myRuntimePlugin: () => FederationRuntimePlugin = function () {
  return {
    name: 'my-platform-plugin',
    async errorLoadRemote() {
      const React = await import('react');
      const FallbackComponent = React.memo(() => {
        return React.createElement(
          'div',
          {
            style: {
              padding: '16px',
              border: '1px solid #ffa39e',
              borderRadius: '4px',
              backgroundColor: '#fff1f0',
              color: '#cf1322'
            }
          },
          'Module loading failed, please try again later'
        );
      });
      FallbackComponent.displayName = 'ErrorFallbackComponent';
      return () => ({
        __esModule: true,
        default: FallbackComponent
      });
    },
  };
};
