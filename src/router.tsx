import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { isChunkLoadError, reloadOnceForChunkError } from "./lib/chunk-recovery";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    onError: (error) => {
      // An outdated page copy would otherwise leave the screen blank.
      if (isChunkLoadError(error)) reloadOnceForChunkError();
    },
  });

  return router;
};
