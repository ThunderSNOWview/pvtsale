import { pinata } from "@/configs/pinata.config";
import { useMutation } from "@tanstack/react-query";

export function useUploadFile() {
  return useMutation({
    mutationFn: async (file: File) => {
      const { cid } = await pinata.upload.public.file(file);
      const url = await pinata.gateways.public.convert(cid);
      
      return { url };
    },
  });
}
