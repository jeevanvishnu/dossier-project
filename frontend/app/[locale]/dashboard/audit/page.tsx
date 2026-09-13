import { redirect } from "next/navigation";

export default function DashboardAuditRedirect() {
  redirect("/journal");
}
