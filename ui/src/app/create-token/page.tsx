import { CreateTokenView } from "@/modules/create-token";
import { generateMetadata } from "@/utils/seo";
import React from "react";

export const metadata = generateMetadata({
  title: "Create Token",
  description: "Create your own token with ease using our token creation tool.",
});

export default function CreateTokenPage() {
  return (
    <>
      <CreateTokenView />
    </>
  );
}
