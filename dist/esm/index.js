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
const console = logs('web3w-walletconnect:index');
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
    // "1337": {host: "localhost", networkName: "Ganache Test Network"},
    // "31337": {host: "localhost", networkName: "BuidlerEVM Test Network"},
    // '77': {host: 'sokol',
    // '99': {host: 'core',
    // '100': {host: 'xdai',
};
class WalletConnectModule {
    constructor(config) {
        this.id = 'walletconnect';
        this.infuraId = config && config.infuraId;
        this.nodeUrl = config && config.nodeUrl;
        this.chainId = config && config.chainId;
    }
    setup(config) {
        return __awaiter(this, void 0, void 0, function* () {
            config = config || {};
            let { chainId, nodeUrl } = config;
            chainId = chainId || this.chainId;
            nodeUrl = nodeUrl || this.nodeUrl;
            if (nodeUrl && !chainId) {
                console.log(`no chanId provided but nodeUrl, fetching chainId...`);
                const response = yield fetch(nodeUrl, {
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
                console.log({ chainId });
            }
            if (!chainId) {
                throw new Error(`chainId missing`);
            }
            const chainIdAsNumber = parseInt(chainId);
            const knownNetwork = knownChainIds[chainId];
            let walletConnectConfig;
            if (this.infuraId && knownNetwork) {
                console.log(`known network, using infuraId: ${this.infuraId}`);
                walletConnectConfig = {
                    infuraId: this.infuraId,
                };
            }
            else {
                console.log(`unknown network, using nodeUrl: ${nodeUrl}`);
                if (!nodeUrl) {
                    throw new Error(`no infuraId or unknown network and nodeURL missing`);
                }
                walletConnectConfig = {
                    rpc: {
                        [chainIdAsNumber]: nodeUrl,
                    },
                };
            }
            this.walletConnectProvider = new WalletConnectProvider(walletConnectConfig);
            yield this.walletConnectProvider.enable();
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
        // return this.walletConnectProvider.close();
        return Promise.resolve();
    }
    disconnect() {
        this.walletConnectProvider.close(); // TODO here (instead of logout) ?
        this.walletConnectProvider = undefined;
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
    constructor(config) {
        this.id = 'walletconnect';
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
                    console.log(`loading ${url}...`);
                    yield loadJS(url, integrity, 'anonymous');
                }
                catch (e) {
                    console.error(`error loading`, e);
                    WalletConnectModuleLoader._jsURLUsed = false;
                    throw e;
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                WalletConnectProvider = window.WalletConnectProvider.default;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                console.log(`WalletConnectProvider Module`, window.WalletConnectProvider);
            }
            return new WalletConnectModule(this.moduleConfig);
        });
    }
}
WalletConnectModuleLoader._jsURL = 'https://cdn.jsdelivr.net/npm/@walletconnect/web3-provider@1.6.6/dist/umd/index.min.js';
WalletConnectModuleLoader._jsURLUsed = false;
//# sourceMappingURL=index.js.map