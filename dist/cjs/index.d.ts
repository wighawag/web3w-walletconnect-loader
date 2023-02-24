import type { Web3WModule, Web3WModuleLoader } from 'web3w';
interface EthereumRpcMap {
    [chainId: string]: string;
}
interface Metadata {
    name: string;
    description: string;
    url: string;
    icons: string[];
}
interface EthereumProviderOptions {
    projectId: string;
    chains: number[];
    optionalChains?: number[];
    methods?: string[];
    optionalMethods?: string[];
    events?: string[];
    optionalEvents?: string[];
    rpcMap?: EthereumRpcMap;
    metadata?: Metadata;
    showQrModal?: boolean;
}
export declare class WalletConnectModuleLoader implements Web3WModuleLoader {
    readonly id: string;
    private static _jsURL;
    private static _jsURLIntegrity;
    private static _jsURLUsed;
    private moduleConfig;
    static setJsURL(jsURL: string, jsURLIntegrity?: string): void;
    constructor(config: EthereumProviderOptions);
    load(): Promise<Web3WModule>;
}
export {};
//# sourceMappingURL=index.d.ts.map