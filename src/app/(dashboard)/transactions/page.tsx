import { createClient } from "@/lib/supabase/server";
import TransactionsClient from "@/components/TransactionsClient";
import { Category, Transaction } from "@/types";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: transactions }, { data: categories }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*, category:categories(*)")
      .eq("user_id", user!.id)
      .order("date", { ascending: false })
      .limit(200),
    supabase
      .from("categories")
      .select("*")
      .eq("user_id", user!.id)
      .order("name"),
  ]);

  return (
    <TransactionsClient
      initialTransactions={(transactions ?? []) as Transaction[]}
      categories={(categories ?? []) as Category[]}
    />
  );
}
