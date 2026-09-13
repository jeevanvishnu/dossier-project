import { redirect } from "next/navigation";

export default function DashboardSubscriptionsRedirect() {
  redirect("/tariffs");
}
