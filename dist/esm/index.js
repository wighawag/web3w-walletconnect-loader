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
let WalletConnectProvider; // EthereumProvider class
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
class WalletConnectModule {
    constructor(config) {
        this.id = 'walletconnect';
        this.config = config;
    }
    setup(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const configToUse = config ? Object.assign(Object.assign({}, this.config), config) : this.config;
            if (!configToUse.chains || configToUse.chains.length === 0) {
                throw new Error(`chains missing`);
            }
            if (!configToUse.projectId) {
                throw new Error(`projectId missing`);
            }
            const walletConnectConfig = {
                projectId: configToUse.projectId,
                chains: configToUse.chains,
            };
            this.walletConnectProvider = yield WalletConnectProvider.init(walletConnectConfig);
            yield this.walletConnectProvider.enable();
            const response = yield this.walletConnectProvider.request({ method: 'eth_chainId' });
            let chainId = configToUse.chains[0].toString();
            if (configToUse.chains.length > 1) {
                chainId = parseInt(response.slice(2), 16).toString();
            }
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
                WalletConnectProvider = window['@walletconnect/ethereum-provider'].EthereumProvider;
            }
            return new WalletConnectModule(this.moduleConfig);
        });
    }
}
WalletConnectModuleLoader._jsURL = 'https://unpkg.com/@walletconnect/ethereum-provider@2.4.6/dist/index.umd.js';
WalletConnectModuleLoader._jsURLUsed = false;
//# sourceMappingURL=index.js.map