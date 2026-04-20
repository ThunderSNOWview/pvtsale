import { createModalHook, EModalKey } from "./root";

export type TAuthModalData = {
  closeable: boolean;
};
export const useAuthModal = createModalHook<TAuthModalData>(EModalKey.AuthModal);
