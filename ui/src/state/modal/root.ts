import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useShallow } from "zustand/react/shallow";

export type TModalState<D extends Record<string, any> = any> = {
  open: boolean;
  data?: D;
};

export type TModalHookState<D extends Record<string, any>> = TModalState<D> & {
  setModalOpen: (open: boolean) => void;
  setModalData: (data: Partial<D>) => void;
};

export enum EModalKey {
  AuthModal = "AuthModal",
  CwethWrapModal = "CwethWrapModal",
}

export type TModalStore = {
  modals: {
    [key in EModalKey]: TModalState;
  };
  setModalOpenState: (key: EModalKey, open: boolean) => void;
  setModalDataState: (key: EModalKey, data: Record<string, any>) => void;
};

export const useModalStore = create<TModalStore, [["zustand/immer", never]]>(
  immer((set) => ({
    modals: {
      [EModalKey.AuthModal]: { open: false, data: { closeable: false } },
      [EModalKey.CwethWrapModal]: { open: false, data: { closeable: false } },
    },
    setModalOpenState: (key, open) => {
      set((state) => {
        state.modals[key].open = open;
      });
    },
    setModalDataState: (key, data) => {
      set((state) => {
        if (!state.modals[key].data) {
          state.modals[key].data = {};
        }
        Object.assign(state.modals[key].data, data);
      });
    },
  }))
);

export const createModalHook =
  <D extends Record<string, any> = any>(key: EModalKey) =>
  (): TModalHookState<D> => {
    return useModalStore(
      useShallow((state) => ({
        ...state.modals[key],
        setModalOpen: (open) => state.setModalOpenState(key, open),
        setModalData: (data) => state.setModalDataState(key, data),
      }))
    );
  };
