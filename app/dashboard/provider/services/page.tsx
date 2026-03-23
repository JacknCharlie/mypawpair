import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProviderServicesPage } from "@/components/provider/provider-services-page";

export const dynamic = "force-dynamic";

export default async function ProviderServicesPageRoute() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/auth/login");

  const userId = claimsData.claims.sub as string;

  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!provider) redirect("/onboarding/provider");

  const { data: services } = await supabase
    .from("provider_services")
    .select("id, name, description, price, price_type, duration_minutes, is_active")
    .eq("provider_id", provider.id)
    .order("created_at", { ascending: false });

  return (
    <ProviderServicesPage
      providerId={provider.id}
      initialServices={(services ?? []).map((s) => ({
        ...s,
        price_type: s.price_type as string | null,
      }))}
    />
  );
}
