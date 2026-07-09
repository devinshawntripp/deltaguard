import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";
import ContentCalendarClient from "./ContentCalendarClient";

export const metadata: Metadata = {
  title: `Content Calendar | ${APP_NAME}`,
  description:
    "Admin-only content calendar for the blog drip campaign — publish schedule, status, and keyword metrics per article.",
};

export default function AdminContentCalendarPage() {
  return <ContentCalendarClient />;
}
