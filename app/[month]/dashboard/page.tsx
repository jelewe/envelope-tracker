//Server

import { redirect } from "next/navigation";
import { currentYYYYMM, isYYYYMM } from "@/lib/date";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;

  if (!isYYYYMM(month)) {
    redirect(`/${currentYYYYMM()}/dashboard`);
  }

  return <DashboardClient month={month} />;
}