import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-mesh-light">
      <Sidebar userEmail={user.email ?? ""} />
      <main className="flex-1 lg:ml-72 p-5 lg:p-8">{children}</main>
    </div>
  );
}
