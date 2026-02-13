import cors from "@fastify/cors";
import Fastify from "fastify";

export const buildApp = () => {
  const app = Fastify({
    logger: true
  });

  app.register(cors, {
    origin: true
  });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  return app;
};
