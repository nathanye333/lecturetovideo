type LogFields = Record<string, string | number | boolean | undefined>;

function log(level: "info" | "warn" | "error", message: string, fields?: LogFields): void {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...fields,
  };
  console[level](JSON.stringify(payload));
}

export const logger = {
  info: (message: string, fields?: LogFields) => log("info", message, fields),
  warn: (message: string, fields?: LogFields) => log("warn", message, fields),
  error: (message: string, fields?: LogFields) => log("error", message, fields),
};
