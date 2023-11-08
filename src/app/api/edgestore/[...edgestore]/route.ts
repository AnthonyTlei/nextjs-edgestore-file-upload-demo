import { initEdgeStore } from "@edgestore/server";
import {
  CreateContextOptions,
  createEdgeStoreNextHandler,
} from "@edgestore/server/adapters/next/app";
import { z } from "zod";

type Context = {
  userId: string;
  userRole: "admin" | "user";
};

function createContext({ req }: CreateContextOptions): Context {
  // TODO: replace hardcoded sessopm with auth provider (clerk)
  return {
    userId: "123",
    userRole: "admin",
  };
  // return {
  //   userId: "1234",
  //   userRole: "user",
  // };
}

const es = initEdgeStore.context<Context>().create();

const edgeStoreRouter = es.router({
  myPublicImages: es
    .imageBucket({
      maxSize: 10 * 1024 * 1024, // 10MB
    })
    .input(
      z.object({
        type: z.enum(["post", "profile"]),
      })
    )
    .path(({ input }) => [{ type: input.type }]),
  myProtectedFiles: es
    .fileBucket()
    .path(({ ctx }) => [{ owner: ctx.userId }])
    .accessControl({
      OR: [
        {
          userId: { path: "owner" },
        },
        {
          userRole: "admin",
        },
      ],
    }),
});

const handler = createEdgeStoreNextHandler({
  router: edgeStoreRouter,
  createContext,
});

export { handler as GET, handler as POST };

export type EdgeStoreRouter = typeof edgeStoreRouter;
