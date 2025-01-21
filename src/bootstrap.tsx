import React from 'react';
import ReactDOM from 'react-dom/client';
import { init } from '@module-federation/runtime';
import { myRuntimePlugin } from './mf-plugin';
import { RouterProvider, createRouter, ErrorComponent } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

init({
  name: 'BENTO-PLATFORM',
  plugins: [myRuntimePlugin()],
  remotes: [
    {
      "name": "foo",
      "entry": "http://localhost:3001/mf-manifest.json"
    },
    {
      "name": "bar",
      "entry": "http://localhost:3004/mf-manifest.json"
    },
  ],
});

export const router = createRouter({
  routeTree,
  defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
  context: {},
  defaultPreload: 'intent',
});

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<RouterProvider router={router} />);
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}