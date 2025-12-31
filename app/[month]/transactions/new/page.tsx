//Server wrapper

import { redirect } from "next/navigation";
import { currentYYYYMM, isYYYYMM } from "@/lib/date";
import NewTransactionClient from "./NewTransactionClient";

export default async function NewTransactionPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;

  if (!isYYYYMM(month)) {
    redirect(`/${currentYYYYMM()}/dashboard`);
  }

  return <NewTransactionClient month={month} />;
}