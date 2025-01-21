import { loadRemote, preloadRemote } from '@module-federation/runtime';
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/index/other')({
  component: RouteComponent,
  loader: async () => {
    /**
     * Here we could `try/catch` this to handle this issue, yes. However, instead of this
     * preload, if the component contained certain federated/shared deps, `initializeSharing`
     * gets called no matter what which will also trigger `getManifest` and the error logger 
     * to be called in a way we cannot `try/catch`. This causes nearly every route to fail 
     * with the same error this preload triggers here.
     */
    await preloadRemote([{
      nameOrAlias: 'foo'
    }]);
  }
});

function RouteComponent() {
  return (<>
    <br/>
    <Link to="/">Back to home page</Link>
  </>)
}
