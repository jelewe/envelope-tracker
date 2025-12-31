//Server wrapper

import { redirect } from "next/navigation";
import { currentYYYYMM, isYYYYMM } from "@/lib/date";
import NewEnvelopeClient from "./NewEnvelopeClient";

export default async function NewEnvelopePage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;

  if (!isYYYYMM(month)) {
    redirect(`/${currentYYYYMM()}/dashboard`);
  }

  return <NewEnvelopeClient month={month} />;
}