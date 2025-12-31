import { redirect } from "next/navigation";
import { currentYYYYMM, isYYYYMM } from "@/lib/date";
import EnvelopeDetailClient from "./EnvelopeDetailClient";

export default async function EnvelopeDetailPage({
  params,
}: {
  params: Promise<{ month: string; envelopeId: string }>;
}) {
  const { month, envelopeId } = await params;

  if (!isYYYYMM(month)) {
    redirect(`/${currentYYYYMM()}/dashboard`);
  }

  return <EnvelopeDetailClient month={month} envelopeId={envelopeId} />;
}