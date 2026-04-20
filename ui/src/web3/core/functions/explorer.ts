import { ChainId } from "../constants";

const explorers = {
  etherscan: (link: string, data: string, type: "transaction" | "token" | "address" | "block") => {
    switch (type) {
      case "transaction":
        return `${link}/tx/${data}`;
      default:
        return `${link}/${type}/${data}`;
    }
  },

  snowtrace: (link: string, data: string, type: "transaction" | "token" | "address" | "block") => {
    switch (type) {
      case "transaction":
        return `${link}/tx/${data}`;
      default:
        return `${link}/${type}/${data}`;
    }
  },

  blockscout: (link: string, data: string, type: "transaction" | "token" | "address" | "block") => {
    switch (type) {
      case "transaction":
        return `${link}/tx/${data}`;
      case "token":
        return `${link}/tokens/${data}`;
      default:
        return `${link}/${type}/${data}`;
    }
  },

  harmony: (link: string, data: string, type: "transaction" | "token" | "address" | "block") => {
    switch (type) {
      case "transaction":
        return `${link}/tx/${data}`;
      case "token":
        return `${link}/address/${data}`;
      default:
        return `${link}/${type}/${data}`;
    }
  },

  okex: (link: string, data: string, type: "transaction" | "token" | "address" | "block") => {
    switch (type) {
      case "transaction":
        return `${link}/tx/${data}`;
      case "token":
        return `${link}/tokenAddr/${data}`;
      default:
        return `${link}/${type}/${data}`;
    }
  },
  moonriver: (link: string, data: string, type: "transaction" | "token" | "address" | "block") => {
    switch (type) {
      case "transaction":
        return `${link}/tx/${data}`;
      case "token":
        return `${link}/tokens/${data}`;
      default:
        return `${link}/${type}/${data}`;
    }
  },
  fuse: (link: string, data: string, type: "transaction" | "token" | "address" | "block") => {
    switch (type) {
      case "transaction":
        return `${link}/tx/${data}`;
      case "token":
        return `${link}/tokens/${data}`;
      default:
        return `${link}/${type}/${data}`;
    }
  },
  telos: (link: string, data: string, type: "transaction" | "token" | "address" | "block") => {
    switch (type) {
      case "transaction":
        return `${link}/transaction/${data}`;
      case "token":
        return `${link}/address/${data}`;
      case "address":
        return `${link}/address/${data}`;
      default:
        return `${link}/${type}/${data}`;
    }
  },
  moonbeam: (link: string, data: string, type: "transaction" | "token" | "address" | "block") => {
    switch (type) {
      case "transaction":
        return `${link}/tx/${data}`;
      case "token":
        return `${link}/tokens/${data}`;
      default:
        return `${link}/${type}/${data}`;
    }
  },
};
interface ChainObject {
  [chainId: number]: {
    link: string;
    builder: (chainName: string, data: string, type: "transaction" | "token" | "address" | "block") => string;
  };
}

const chains: ChainObject = {
  [ChainId.SEPOLIA]: {
    link: "https://sepolia.etherscan.io",
    builder: explorers.etherscan,
  },
};

export function getExplorerLink(
  chainId: ChainId | undefined,
  data: string,
  type: "transaction" | "token" | "address" | "block"
): string {
  if (!chainId) return "";

  const chain = chains[chainId];
  if (!chain) {
    console.debug("could not found chain builder correspond with chain", chainId);
    return "";
  }
  return chain.builder(chain.link, data, type);
}
