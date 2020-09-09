var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { logs } from 'named-logs';
const console = logs('web3w-portis:index');
let WalletConnectProvider;
function loadJS(url, integrity, crossorigin) {
    return new Promise(function (resolve, reject) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        if (integrity) {
            script.integrity = integrity;
        }
        if (crossorigin) {
            script.crossOrigin = crossorigin;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        script.onload = script.onreadystatechange = function () {
            resolve();
        };
        script.onerror = function () {
            reject();
        };
        document.head.appendChild(script);
    });
}
const knownChainIds = {
    '1': { host: 'mainnet', networkName: 'Main Ethereum Network' },
    '3': { host: 'ropsten', networkName: 'Ropsten Test Network' },
    '4': { host: 'rinkeby', networkName: 'Rinkeby Test Network' },
    '5': { host: 'goerli', networkName: 'Goerli Test Network' },
    '42': { host: 'kovan', networkName: 'Kovan Test Network' },
};
class WalletConnectModule {
    constructor(config) {
        this.id = 'walletconnect';
        this.infuraId = config && config.infuraId;
        this.forceFallbackUrl = config && config.forceFallbackUrl;
        this.fallbackUrl = config && config.fallbackUrl;
        this.chainId = config && config.chainId;
        this.config = config; // TODO use ?
    }
    setup(config) {
        return __awaiter(this, void 0, void 0, function* () {
            config = config || {};
            let { chainId, fallbackUrl } = config;
            chainId = chainId || this.chainId;
            fallbackUrl = fallbackUrl || this.fallbackUrl;
            if (fallbackUrl && !chainId) {
                const response = yield fetch(fallbackUrl, {
                    headers: {
                        'content-type': 'application/json; charset=UTF-8',
                    },
                    body: JSON.stringify({
                        id: Math.floor(Math.random() * 1000000),
                        jsonrpc: '2.0',
                        method: 'eth_chainId',
                        params: [],
                    }),
                    method: 'POST',
                });
                const json = yield response.json();
                chainId = parseInt(json.result.slice(2), 16).toString();
            }
            if (!chainId) {
                throw new Error(`chainId missing`);
            }
            const chainIdAsNumber = parseInt(chainId);
            const knownNetwork = knownChainIds[chainId];
            let network;
            if (knownNetwork && !this.forceFallbackUrl) {
                network = Object.assign(Object.assign({}, knownNetwork), { chainId: chainIdAsNumber });
            }
            else {
                network = {
                    host: fallbackUrl,
                    chainId: chainIdAsNumber,
                };
            }
            let walletConnectConfig;
            if (this.infuraId && knownNetwork) {
                walletConnectConfig = {
                    infuraId: this.infuraId,
                };
            }
            else {
                walletConnectConfig = {
                    rpc: {
                        [chainId]: fallbackUrl,
                    },
                };
            }
            this.walletConnectProvider = new WalletConnectProvider(walletConnectConfig);
            // TODO remove
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            window.walletConnectProvider = this.walletConnectProvider;
            return {
                web3Provider: this.walletConnectProvider,
                chainId,
            };
        });
    }
    logout() {
        return this.walletConnectProvider.close();
    }
    disconnect() {
        // this.walletConnectProvider.close(); // TODO here (instead of logout)
        // TODO remove
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.walletConnectProvider = undefined;
    }
    isLoggedIn() {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
}
export class WalletConnectModuleLoader {
    constructor(dappId, config) {
        this.id = 'portis';
        this.dappId = dappId;
        this.moduleConfig = config;
    }
    static setJsURL(jsURL, jsURLIntegrity) {
        if (WalletConnectModuleLoader._jsURLUsed) {
            throw new Error(`cannot change js url once used`);
        }
        WalletConnectModuleLoader._jsURL = jsURL;
        WalletConnectModuleLoader._jsURLIntegrity = jsURLIntegrity;
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!WalletConnectProvider) {
                const url = WalletConnectModuleLoader._jsURL;
                const integrity = WalletConnectModuleLoader._jsURLIntegrity;
                WalletConnectModuleLoader._jsURLUsed = true;
                try {
                    yield loadJS(url, integrity, 'anonymous');
                }
                catch (e) {
                    WalletConnectModuleLoader._jsURLUsed = false;
                    throw e;
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                WalletConnectProvider = window.WalletConnectProvider.default;
            }
            return new WalletConnectModule(this.moduleConfig);
        });
    }
}
WalletConnectModuleLoader._jsURL = 'https://cdn.jsdelivr.net/npm/@walletconnect/web3-provider@1.0.13/dist/umd/index.min.js';
WalletConnectModuleLoader._jsURLUsed = false;
//# sourceMappingURL=index.js.map