import { CreateLaunchpadView } from "@/modules/create-launchpad";
import { generateMetadata } from "@/utils/seo";
import React from "react";

export const metadata = generateMetadata({
  title: "Create Launchpad",
  description: "Create your own launchpad for token launches with ease.",
});

export default function CreateLaunchpadPage() {
  return (
    <>
      <CreateLaunchpadView />
    </>
  );
}
