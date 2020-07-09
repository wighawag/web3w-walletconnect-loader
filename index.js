/*
<script
  src="https://cdn.jsdelivr.net/npm/@walletconnect/web3-provider@1.0.13/dist/umd/index.min.js"
></script>
*/

function loadJS(url, integrity, crossorigin) {
  return new Promise(function (resolve, reject) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    if (integrity) {
      script.integrity = integrity;
    }
    if (crossorigin) {
      script.crossOrigin = crossorigin;
    }
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
  "1": {host: "mainnet", networkName: "Main Ethereum Network"},
  "3": {host: "ropsten", networkName: "Ropsten Test Network"},
  "4": {host: "rinkeby", networkName: "Rinkeby Test Network"},
  "5": {host: "goerli", networkName: "Goerli Test Network"},
  "42": {host: "kovan", networkName: "Kovan Test Network"},
  // "1337": {host: "localhost", networkName: "Ganache Test Network"},
  // "31337": {host: "localhost", networkName: "BuidlerEVM Test Network"},
  // '77': {host: 'sokol',
  // '99': {host: 'core',
  // '100': {host: 'xdai',
};

let WalletConnectProvider;

function WalletConnectModule(conf) {
  conf = conf || {};
  const {
    forceFallbackUrl,
    fallbackUrl,
    chainId,
    jsURL,
    jsURLIntegrity,
    infuraId,
  } = conf;
  this.id = "walletconnect";
  this.infuraId = infuraId;
  this.jsURL = jsURL;
  this.jsURLIntegrity = jsURLIntegrity;
  this.chainId = chainId;
  this.forceFallbackUrl = forceFallbackUrl;
  this.fallbackUrl = fallbackUrl;
}

WalletConnectModule.prototype.setup = async function (config) {
  config = config || {};
  let {chainId, fallbackUrl} = config;
  chainId = chainId || this.chainId;
  fallbackUrl = fallbackUrl || this.fallbackUrl;

  const url =
    this.jsURL ||
    "https://cdn.jsdelivr.net/npm/@walletconnect/web3-provider@1.0.13/dist/umd/index.min.js";
  const integrity = this.jsURLIntegrity;
  await loadJS(url, integrity, "anonymous");
  WalletConnectProvider = window.WalletConnectProvider.default;

  if (fallbackUrl && !chainId) {
    const response = await fetch(fallbackUrl, {
      headers: {
        "content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        id: Math.floor(Math.random() * 1000000),
        jsonrpc: "2.0",
        method: "eth_chainId",
        params: [],
      }),
      method: "POST",
    });
    const json = await response.json();
    chainId = parseInt(json.result.slice(2), 16);
  }

  let chainIdAsNumber;
  if (typeof chainId === "number") {
    chainIdAsNumber = chainId;
  } else {
    if (chainId.slice(0, 2) === "0x") {
      chainIdAsNumber = parseInt(chainId.slice(2), 16);
    } else {
      chainIdAsNumber = parseInt(chainId, 10);
    }
  }

  const knownNetwork = knownChainIds[chainId];

  let network;
  if (knownNetwork && !this.forceFallbackUrl) {
    network = {
      ...knownNetwork,
      chainId: chainIdAsNumber,
    };
  } else {
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
  } else {
    walletConnectConfig = {
      rpc: {
        [chainId]: fallbackUrl,
      },
    };
  }

  this.walletConnectProvider = new WalletConnectProvider(walletConnectConfig);
  window.walletConnectProvider = this.walletConnectProvider;
  return {
    web3Provider: this.walletConnectProvider,
    chainId,
  };
};

WalletConnectModule.prototype.logout = async function () {
  this.walletConnectProvider.close();
};

WalletConnectModule.prototype.isLoggedIn = async function () {
  return true;
};

WalletConnectModule.prototype.showWallet = function () {};

WalletConnectModule.prototype.showButton = function () {};

WalletConnectModule.prototype.hideButton = function () {};

WalletConnectModule.prototype.initiateTopup = async function (
  provider,
  params
) {};

module.exports = WalletConnectModule;
