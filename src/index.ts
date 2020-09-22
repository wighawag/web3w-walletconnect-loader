import type {Web3WModule, WindowWeb3Provider, Web3WModuleLoader} from 'web3w';
import {logs} from 'named-logs';
const console = logs('web3w-walletconnect:index');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WalletConnectProviderJS = any;

type Config = {
  chainId?: string;
  fallbackUrl?: string;
  infuraId?: string;
};

let WalletConnectProvider: WalletConnectProviderJS;

function loadJS(url: string, integrity: string | undefined, crossorigin: string) {
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
    script.onload = (script as any).onreadystatechange = function () {
      resolve();
    };
    script.onerror = function () {
      reject();
    };
    document.head.appendChild(script);
  });
}
const knownChainIds: {[chainId: string]: {host: string; networkName: string}} = {
  '1': {host: 'mainnet', networkName: 'Main Ethereum Network'},
  '3': {host: 'ropsten', networkName: 'Ropsten Test Network'},
  '4': {host: 'rinkeby', networkName: 'Rinkeby Test Network'},
  '5': {host: 'goerli', networkName: 'Goerli Test Network'},
  '42': {host: 'kovan', networkName: 'Kovan Test Network'},
  // "1337": {host: "localhost", networkName: "Ganache Test Network"},
  // "31337": {host: "localhost", networkName: "BuidlerEVM Test Network"},
  // '77': {host: 'sokol',
  // '99': {host: 'core',
  // '100': {host: 'xdai',
};

class WalletConnectModule implements Web3WModule {
  public readonly id = 'walletconnect';

  private fallbackUrl: string | undefined;
  private chainId: string | undefined;
  private infuraId: string | undefined;

  private walletConnectProvider: WalletConnectProviderJS;

  constructor(config?: Config) {
    this.infuraId = config && config.infuraId;
    this.fallbackUrl = config && config.fallbackUrl;
    this.chainId = config && config.chainId;
  }

  async setup(config?: Config): Promise<{chainId: string; web3Provider: WindowWeb3Provider}> {
    config = config || {};
    let {chainId, fallbackUrl} = config;
    chainId = chainId || this.chainId;
    fallbackUrl = fallbackUrl || this.fallbackUrl;

    if (fallbackUrl && !chainId) {
      const response = await fetch(fallbackUrl, {
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
      const json = await response.json();
      chainId = parseInt(json.result.slice(2), 16).toString();
    }

    if (!chainId) {
      throw new Error(`chainId missing`);
    }
    const chainIdAsNumber = parseInt(chainId);

    const knownNetwork = knownChainIds[chainId];

    let walletConnectConfig;
    if (this.infuraId && knownNetwork) {
      walletConnectConfig = {
        infuraId: this.infuraId,
      };
    } else {
      walletConnectConfig = {
        rpc: {
          [chainIdAsNumber]: fallbackUrl,
        },
      };
    }

    this.walletConnectProvider = new WalletConnectProvider(walletConnectConfig);

    // TODO remove
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).walletConnectProvider = this.walletConnectProvider;

    return {
      web3Provider: this.walletConnectProvider,
      chainId,
    };
  }

  logout(): Promise<void> {
    return this.walletConnectProvider.close();
  }

  disconnect(): void {
    // this.walletConnectProvider.close(); // TODO here (instead of logout)

    // TODO remove
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).walletConnectProvider = undefined;
  }

  async isLoggedIn(): Promise<boolean> {
    return true;
  }
}

export class WalletConnectModuleLoader implements Web3WModuleLoader {
  public readonly id: string = 'walletconnect';

  private static _jsURL = 'https://cdn.jsdelivr.net/npm/@walletconnect/web3-provider@1.0.13/dist/umd/index.min.js';
  private static _jsURLIntegrity: string | undefined;
  private static _jsURLUsed = false;

  private moduleConfig: Config | undefined;

  static setJsURL(jsURL: string, jsURLIntegrity?: string): void {
    if (WalletConnectModuleLoader._jsURLUsed) {
      throw new Error(`cannot change js url once used`);
    }
    WalletConnectModuleLoader._jsURL = jsURL;
    WalletConnectModuleLoader._jsURLIntegrity = jsURLIntegrity;
  }

  constructor(config?: Config) {
    this.moduleConfig = config;
  }

  async load(): Promise<Web3WModule> {
    if (!WalletConnectProvider) {
      const url = WalletConnectModuleLoader._jsURL;
      const integrity = WalletConnectModuleLoader._jsURLIntegrity;
      WalletConnectModuleLoader._jsURLUsed = true;
      try {
        await loadJS(url, integrity, 'anonymous');
      } catch (e) {
        WalletConnectModuleLoader._jsURLUsed = false;
        throw e;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      WalletConnectProvider = (window as any).WalletConnectProvider.default;
    }
    return new WalletConnectModule(this.moduleConfig);
  }
}
