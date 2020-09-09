declare module "index" {
    import type { Web3WModule, Web3WModuleLoader } from 'web3w';
    type WalletConnectConfig = any;
    export class WalletConnectModuleLoader implements Web3WModuleLoader {
        readonly id: string;
        private static _jsURL;
        private static _jsURLIntegrity;
        private static _jsURLUsed;
        private moduleConfig;
        static setJsURL(jsURL: string, jsURLIntegrity?: string): void;
        constructor(config?: {
            forceFallbackUrl?: boolean;
            fallbackUrl?: string;
            chainId?: string;
            config?: WalletConnectConfig;
        });
        load(): Promise<Web3WModule>;
    }
}
//# sourceMappingURL=index.d.ts.map