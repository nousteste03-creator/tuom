const isDev = __DEV__ === true;

/**
 * Logger centralizado para autenticação
 * Ativo apenas em DEV
 */
export const authLogger = {
  info: (scope: string, ...args: any[]) => {
    if (!isDev) return;
    console.log(`🔐 [${scope}]`, ...args);
  },

  warn: (scope: string, ...args: any[]) => {
    if (!isDev) return;
    console.warn(`⚠️ [${scope}]`, ...args);
  },

  error: (scope: string, ...args: any[]) => {
    if (!isDev) return;
    console.error(`❌ [${scope}]`, ...args);
  },
};
