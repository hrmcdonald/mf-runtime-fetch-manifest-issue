# `@module-federation/runtime` manifest `fetch` issue

This repo contains a very small recreation of an issue within the `@module-federation/runtime` that can throw an exception when a fetch to load an `mf-manifest.json` file fails for whatever reason.

### Demo

- `npm install`
- `npm run dev`
- Click the first link that appears to trigger the issue

## Issue

When the MF runtime attempts to fetch any remote registered with an `mf-manifest.json`, if it fails, an exception is thrown. Today, there is no hook for handling this. A hook exists to provide the fetch itself, `.catch`ing that fetch does not resolve the issue here at all since other internal logic still "logs" the error leading to the exception being thrown regardless. 

Depending upon what triggered the runtime to attempt to attempt the `fetch`, it might even not be something we can catch at all. In this recreation project, I am triggering the manifest fetch manually with a `preloadRemote` call. **However**, in our more complicated internal project (that I unfortunately cannot share here) **even just shared dependency loading can lead to remote manifests getting fetched and throwing an error we cannot catch and handle**. This happens in the snapshot plugin even if nothing is done those remotes yet. This leads to the MF runtime throwing exceptions beyond our control that crash portions of our app like routing which can affect routes unrelated to the unreachable remote when _any_ remote is unavailable at all for some reason.

### Cause

Any call to `SnapshotHandler.getManifest()` will cause an unhandled exception to get thrown that we potentially have no way to handle. This can be triggered by `preloadRemote`, but also by the MF runtime itself when, for example, `ShareHandler.initializeSharing()` is called. That can trigger `initRemoteModule()` and eventually `getManifest()`.

While the `fetch` within `getManifest()` is itself handled with a `try/catch`, it calls an `error(msg)` logging method that then rethrows an error with the logged message. I think this is really the root of the issue here tbh.

Why is this a problem? Well because often times routing can trigger dependencies to be imported. The `error` thrown here disrupts that process and causes at least `@tanstack/react-router` to fail on any route change even those not obviously related to the problematic remote in any way.

Links to referenced methods:
- [getManifest() fetch](https://github.com/module-federation/core/blob/3d83f9d7386f633c1dfe4a816dc682275c1d89f0/packages/runtime-core/src/plugins/snapshot/SnapshotHandler.ts#L305)
- [logger error() throw](https://github.com/module-federation/core/blob/3d83f9d7386f633c1dfe4a816dc682275c1d89f0/packages/runtime-core/src/utils/logger.ts#L19)
- [initializeSharing()](https://github.com/module-federation/core/blob/3d83f9d7386f633c1dfe4a816dc682275c1d89f0/packages/runtime-core/src/shared/index.ts#L255)

### Potential Solution

We need a way to handle any errors thrown by the `getManifest` fetch before it calls `error(msg)` or really just exceptions thrown by `error(msg)` function in general. **Anything that could log an error through that error method might result in this issue to be honest.** (Does this need to `throw` the message instead of just log it as an error?)

Throwing errors are fine, as long as we have a path to hook into handling them. An `errorLoadManifest` hook might fit in line with `errorLoadRemote`? Alternatively just a `handleError` hook for dealing with errors that get logged via `error(msg)` instead of having that rethrow them no matter what.

### Potential Alternatives

- `errorLoadRemote` does not help here. This gets thrown separately from that hook regardless. I included the common example implementation for handling issues with that plugin hook to showcase it not helping here.
- This is not a CORs issue. If a remote is unavailable for a moment, we can't have the entire site potentially throwing errors
- We could potentially add some custom logic to error handling in our router more globally, but it'd be difficult to reliably discern what is a generic error being thrown by the MF runtime and how to handle it from there.
- A similar thread suggested a plugin that adjusts `shareStrategy` fixes this. It fixes a similar issue, but will not help handle this kind of exception getting thrown at all.

There are a few other past closed issues I read through on this that were either only tangentially related or never really uncovered the heart of this particular issue. If I did miss one that calls out a way to handle this kind of edge-case though please let me know and I'll review to confirm what fix/workaround/implementation adjustment works.