import { redirect } from "next/navigation";
import { currentYYYYMM } from "@/lib/date";

export default function Home() {
  redirect(`/${currentYYYYMM()}/dashboard`);
}