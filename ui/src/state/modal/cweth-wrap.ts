import { createModalHook, EModalKey } from "./root";

export type TCwethWrapModalData = {
  closeable: boolean;
};
export const useCwethWrapModal = createModalHook<TCwethWrapModalData>(EModalKey.CwethWrapModal);
