type ProviderAccounts = string[];
interface ProviderMessage {
  type: string;
  data: unknown;
}
interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}
interface ProviderInfo {
  chainId: string;
}
interface RequestArguments {
  method: string;
  params?: unknown[] | unknown;
}
type ProviderChainId = ProviderInfo['chainId'];

interface EIP1193Provider {
  on(event: 'connect', listener: (info: ProviderInfo) => void): this;
  on(event: 'disconnect', listener: (error: ProviderRpcError) => void): this;
  on(event: 'message', listener: (message: ProviderMessage) => void): this;
  on(event: 'chainChanged', listener: (chainId: ProviderChainId) => void): this;
  on(event: 'accountsChanged', listener: (accounts: ProviderAccounts) => void): this;
  request(args: RequestArguments): Promise<unknown>;
}

interface IEthereumProvider extends EIP1193Provider {
  enable(): Promise<ProviderAccounts>;
}
type ProviderEvent =
  | 'connect'
  | 'disconnect'
  | 'message'
  | 'chainChanged'
  | 'accountsChanged'
  | 'session_delete'
  | 'session_event'
  | 'session_update'
  | 'display_uri';

interface SignalTypesBaseEventArgs<T = unknown> {
  id: number;
  topic: string;
  params: T;
}
interface SessionTypesBaseNamespace {
  chains?: string[];
  accounts: string[];
  methods: string[];
  events: string[];
}
type SessionTypesNamespace = SessionTypesBaseNamespace;
type SessionTypesNamespaces = Record<string, SessionTypesNamespace>;
type ProposalTypesStruct = any; // TODO
interface SignalTypesEventArguments {
  session_proposal: Omit<SignalTypesBaseEventArgs<ProposalTypesStruct>, 'topic'>;
  session_update: SignalTypesBaseEventArgs<{
    namespaces: SessionTypesNamespaces;
  }>;
  session_extend: Omit<SignalTypesBaseEventArgs, 'params'>;
  session_ping: Omit<SignalTypesBaseEventArgs, 'params'>;
  session_delete: Omit<SignalTypesBaseEventArgs, 'params'>;
  session_expire: {
    topic: string;
  };
  session_request: SignalTypesBaseEventArgs<{
    request: {
      method: string;
      params: any;
    };
    chainId: string;
  }>;
  session_request_sent: {
    request: {
      method: string;
      params: any;
    };
    topic: string;
    chainId: string;
  };
  session_event: SignalTypesBaseEventArgs<{
    event: {
      name: string;
      data: any;
    };
    chainId: string;
  }>;
  proposal_expire: {
    id: number;
  };
}
interface EventArguments {
  connect: ProviderInfo;
  disconnect: ProviderRpcError;
  message: ProviderMessage;
  chainChanged: ProviderChainId;
  accountsChanged: ProviderAccounts;
  session_delete: {
    topic: string;
  };
  session_event: SignalTypesEventArguments['session_event'];
  session_update: SignalTypesEventArguments['session_delete'];
  display_uri: string;
}
interface IEthereumProviderEvents {
  on: <E extends ProviderEvent>(event: E, listener: (args: EventArguments[E]) => any) => any;
  once: <E extends ProviderEvent>(event: E, listener: (args: EventArguments[E]) => any) => any;
  off: <E extends ProviderEvent>(event: E, listener: (args: EventArguments[E]) => any) => any;
  removeListener: <E extends ProviderEvent>(event: E, listener: (args: EventArguments[E]) => any) => any;
  emit: <E extends ProviderEvent>(event: E, payload: EventArguments[E]) => any;
}

type Address = `0x${string}`;
type BlockExplorer = {
  name: string;
  url: string;
};
type Contract = {
  address: Address;
  blockCreated?: number;
};
type NativeCurrency = {
  name: string;
  /** 2-6 characters long */
  symbol: string;
  decimals: number;
};
type RpcUrls = {
  http: readonly string[];
  webSocket?: readonly string[];
};
type Chain = {
  /** ID in number form */
  id: number;
  /** Human-readable name */
  name: string;
  /** Internal network name */
  network: string;
  /** Currency used by chain */
  nativeCurrency: NativeCurrency;
  /** Collection of RPC endpoints */
  rpcUrls: {
    [key: string]: RpcUrls;
    default: RpcUrls;
    public: RpcUrls;
  };
  /** Collection of block explorers */
  blockExplorers?: {
    [key: string]: BlockExplorer;
    default: BlockExplorer;
  };
  /** Collection of contracts */
  contracts?: {
    ensRegistry?: Contract;
    ensUniversalResolver?: Contract;
    multicall3?: Contract;
  };
  /** Flag for test networks */
  testnet?: boolean;
};
interface MobileWallet {
  id: string;
  name: string;
  links: {
    universal: string;
    native?: string;
  };
}
interface DesktopWallet {
  id: string;
  name: string;
  links: {
    native: string;
    universal: string;
  };
}
interface ConfigCtrlState {
  projectId: string;
  walletConnectVersion?: 1 | 2;
  themeMode?: 'dark' | 'light';
  themeColor?: 'blackWhite' | 'blue' | 'default' | 'green' | 'magenta' | 'orange' | 'purple' | 'teal';
  themeBackground?: 'gradient' | 'themeColor';
  themeZIndex?: number;
  standaloneChains?: string[];
  defaultChain?: Chain;
  mobileWallets?: MobileWallet[];
  desktopWallets?: DesktopWallet[];
  walletImages?: Record<string, string>;
  chainImages?: Record<string, string>;
  tokenImages?: Record<string, string>;
  enableStandaloneMode?: boolean;
  enableNetworkView?: boolean;
  enableAccountView?: boolean;
  explorerAllowList?: string[];
  explorerDenyList?: string[];
  termsOfServiceUrl?: string;
  privacyPolicyUrl?: string;
}
type Web3ModalConfig = Omit<ConfigCtrlState, 'enableStandaloneMode'> & {
  walletConnectVersion: 1 | 2;
};

interface OpenOptions {
  uri?: string;
  standaloneChains?: string[];
  route?: 'Account' | 'ConnectWallet' | 'Help' | 'SelectNetwork';
}

interface ModalCtrlState {
  open: boolean;
}

declare class Web3Modal {
  constructor(config: Web3ModalConfig);
  private initUi;
  openModal: (options?: OpenOptions | undefined) => Promise<void>;
  closeModal: () => void;
  subscribeModal: (callback: (newState: ModalCtrlState) => void) => () => void;
  setTheme: (theme: Pick<ConfigCtrlState, 'themeMode' | 'themeColor' | 'themeBackground'>) => void;
}

interface ConnectOps {
  chains?: number[];
  optionalChains?: number[];
  rpcMap?: EthereumRpcMap;
  pairingTopic?: string;
}

declare class EthereumProvider implements IEthereumProvider {
  events: IEthereumProviderEvents;
  namespace: string;
  accounts: string[];
  signer: any; // TODO InstanceType<typeof UniversalProvider>;
  chainId: number;
  modal?: Web3Modal;
  private rpc;
  private readonly STORAGE_KEY;
  constructor();
  static init(opts: EthereumProviderOptions): Promise<EthereumProvider>;
  request<T = unknown>(args: RequestArguments): Promise<T>;
  sendAsync(args: RequestArguments, callback: (error: Error | null, response: any) => void): void;
  get connected(): boolean;
  get connecting(): boolean;
  enable(): Promise<ProviderAccounts>;
  connect(opts?: ConnectOps): Promise<void>;
  disconnect(): Promise<void>;
  on: IEthereumProviderEvents['on'];
  once: IEthereumProviderEvents['once'];
  removeListener: IEthereumProviderEvents['removeListener'];
  off: IEthereumProviderEvents['off'];
  get isWalletConnect(): boolean;
  get session(): any; //TODO SessionTypes.Struct | undefined;
  private registerEventListeners;
  private setHttpProvider;
  private isCompatibleChainId;
  private formatChainId;
  private parseChainId;
  private setChainIds;
  private setChainId;
  private parseAccountId;
  private setAccounts;
  private getRpcConfig;
  private buildRpcMap;
  private initialize;
  private loadConnectOpts;
  private getRpcUrl;
  private loadPersistedSession;
  private reset;
  private persist;
  private parseAccounts;
  private parseAccount;
}

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
