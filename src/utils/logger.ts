import pino from "pino";

const isDevelopment = process.env.NODE_ENV === "development";
const isLocal = !process.env.NAIS_CLUSTER_NAME;

interface SerializedError {
  stack?: string;
  type?: string;
  message?: string;
}

function serializeLogObject(
  object: Record<string, unknown>,
): Record<string, unknown> {
  if (!object.err) {
    return object;
  }

  const err: SerializedError =
    object.err instanceof Error
      ? pino.stdSerializers.err(object.err)
      : (object.err as SerializedError);

  const serialized = { ...object };
  if (err.stack) serialized.stack_trace = err.stack;
  if (err.type) serialized.type = err.type;
  if (err.message) serialized.message = err.message;
  delete serialized.err;

  return serialized;
}

const logger = pino({
  level: isDevelopment ? "debug" : "info",
  timestamp: () => `,"@timestamp":"${new Date().toISOString()}"`,
  messageKey: "message",
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
    log: serializeLogObject,
  },
  ...(isLocal && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
      },
    },
  }),
});

export default logger;
