# Backend health versus completed jobs

Keep process dispatch, HTTP reachability, provider readiness, and completed work as separate states.

- A successful Termux `startService` call means only that Android accepted the dispatch.
- An HTTP response proves reachability only, not successful inference.
- Chat is verified only after a real prompt returns non-empty generated text.
- Image generation is verified only after a real decodable image is returned.
- 3D generation is verified only after a generated GLB/GLTF passes validation and loads in the renderer.
- Offline screens should not require a server unless the user explicitly invokes a backend-dependent feature.

Failure messages should name the missing permission, endpoint, model, worker, or output validation step rather than displaying a generic green/healthy state.
