import * as React from 'react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: IndexComponent,
});

function IndexComponent() {
  return (
    <>
      <br/>
      <div>Navigating to the link below will trigger a "preloadRemote".</div> 
      <div>However the `mf-manifest.json` for the remote is not available,</div> 
      <div>so the fetch will fail and throw an uncaught exception crashing the page.</div>
      <br/>
      <Link to="/index/other">Navigate to other page</Link>
    </>
  );
}
