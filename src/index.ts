import type {Web3WModule, WindowWeb3Provider, Web3WModuleLoader} from 'web3w';
import {logs} from 'named-logs';
const console = logs('web3w-walletconnect:index');

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

type EthereumProvider = any; // EthereumProvider instance's type
let WalletConnectProvider: {init: (options: EthereumProviderOptions) => Promise<EthereumProvider>}; // EthereumProvider class

function loadJS(url: string, integrity: string | undefined, crossorigin: string) {
  return new Promise<void>(function (resolve, reject) {
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

class WalletConnectModule implements Web3WModule {
  public readonly id = 'walletconnect';

  private config: EthereumProviderOptions;
  private walletConnectProvider: EthereumProvider;

  constructor(config: EthereumProviderOptions) {
    this.config = config;
  }

  async setup(config?: EthereumProviderOptions): Promise<{chainId: string; web3Provider: WindowWeb3Provider}> {
    const configToUse = config ? {...this.config, ...config} : this.config;

    if (!configToUse.chains || configToUse.chains.length === 0) {
      throw new Error(`chains missing`);
    }
    if (!configToUse.projectId) {
      throw new Error(`projectId missing`);
    }

    const walletConnectConfig: EthereumProviderOptions = {
      projectId: configToUse.projectId,
      chains: configToUse.chains,
    };

    this.walletConnectProvider = await WalletConnectProvider.init(walletConnectConfig);

    const response = await this.walletConnectProvider.request({method: 'eth_chainId'});

    let chainId = configToUse.chains[0].toString();
    if (configToUse.chains.length > 1) {
      chainId = parseInt(response.slice(2), 16).toString();
    }

    return {
      web3Provider: this.walletConnectProvider,
      chainId,
    };
  }

  logout(): Promise<void> {
    // return this.walletConnectProvider.close();
    return Promise.resolve();
  }

  disconnect(): void {
    this.walletConnectProvider.close(); // TODO here (instead of logout) ?
    this.walletConnectProvider = undefined;

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

  private static _jsURL = 'https://unpkg.com/@walletconnect/ethereum-provider@2.4.6/dist/index.umd.js';
  private static _jsURLIntegrity: string | undefined;
  private static _jsURLUsed = false;

  private moduleConfig: EthereumProviderOptions;

  static setJsURL(jsURL: string, jsURLIntegrity?: string): void {
    if (WalletConnectModuleLoader._jsURLUsed) {
      throw new Error(`cannot change js url once used`);
    }
    WalletConnectModuleLoader._jsURL = jsURL;
    WalletConnectModuleLoader._jsURLIntegrity = jsURLIntegrity;
  }

  constructor(config: EthereumProviderOptions) {
    this.moduleConfig = config;
  }

  async load(): Promise<Web3WModule> {
    if (!WalletConnectProvider) {
      const url = WalletConnectModuleLoader._jsURL;
      const integrity = WalletConnectModuleLoader._jsURLIntegrity;
      WalletConnectModuleLoader._jsURLUsed = true;
      try {
        console.log(`loading ${url}...`);
        await loadJS(url, integrity, 'anonymous');
      } catch (e) {
        console.error(`error loading`, e);
        WalletConnectModuleLoader._jsURLUsed = false;
        throw e;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      WalletConnectProvider = (window as any)['@walletconnect/ethereum-provider'].EthereumProvider;
    }
    return new WalletConnectModule(this.moduleConfig);
  }
}
