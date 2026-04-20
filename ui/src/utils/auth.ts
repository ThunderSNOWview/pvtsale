const ACCESS_TOKEN_KEY = "pvtsale.at";

const getKey = (address: string) => {
  return `${ACCESS_TOKEN_KEY}_${address.toLowerCase()}`;
};

export const authUtils = {
  getKey,
  // access token
  getAccessToken: (address: string) => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(getKey(address));
  },
  setAccessToken: (address: string, at: string) => {
    if (typeof window === "undefined") return null;
    return window.localStorage.setItem(getKey(address), at);
  },
  removeAccessToken: (address: string) => {
    if (typeof window === "undefined") return null;
    return window.localStorage.removeItem(getKey(address));
  },
};
