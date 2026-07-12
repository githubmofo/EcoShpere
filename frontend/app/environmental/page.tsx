// app/environmental/page.tsx
// Member 1 – Redirect base environmental route to the dashboard subpage
import { redirect } from "next/navigation";

export default function EnvironmentalPage() {
  redirect("/environmental/dashboard");
}
