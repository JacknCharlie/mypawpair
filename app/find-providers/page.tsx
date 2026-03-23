import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { FindProvidersContent } from "@/components/find-providers-content";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  grooming: "Grooming",
  training: "Training",
  vet: "Veterinary",
  walking: "Dog Walking",
  boarding: "Boarding",
  other: "Other",
};

export default async function FindProvidersPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; city?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const category = params.category ?? "";
  const city = params.city ?? "";

  let query = supabase
    .from("providers")
    .select(`
      id,
      business_name,
      description,
      category,
      city,
      zip_code,
      phone,
      website,
      email
    `)
    .eq("is_verified", true)
    .order("business_name");

  if (category) query = query.eq("category", category);
  if (city) query = query.ilike("city", `%${city}%`);

  const { data: providers } = await query;

  const categories = [
    { value: "", label: "All categories" },
    { value: "grooming", label: "Grooming" },
    { value: "training", label: "Training" },
    { value: "vet", label: "Veterinary" },
    { value: "walking", label: "Dog Walking" },
    { value: "boarding", label: "Boarding" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="min-h-screen bg-[#F6F2EA]">
      <header className="w-full bg-[#F6F2EA] border-b border-black/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="PawPair"
                width={200}
                height={50}
                className="h-12 w-auto"
                priority
              />
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/ask-ai"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#5F7E9D] text-white text-sm font-medium rounded-xl hover:bg-[#4e6d8c] transition-colors"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                ASK AI
              </Link>
              <Link
                href="/auth/provider-signup"
                className="text-[#5F7E9D] text-sm font-medium hover:underline"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Become a Provider
              </Link>
              <Link
                href="/auth/login"
                className="text-[#5F7E9D] text-sm font-medium hover:underline"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-10">
          <h1
            className="text-[#2F3E4E] text-[32px] md:text-[40px] font-semibold leading-[120%]"
            style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
          >
            Find Trusted Providers
          </h1>
          <p className="text-gray-500 text-[16px] mt-2 max-w-xl mx-auto" style={{ fontFamily: "Inter, sans-serif" }}>
            Groomers, trainers, vets, and more — verified by PawPair
          </p>
        </div>

        <FindProvidersContent
          providers={providers ?? []}
          categories={categories}
          initialCategory={category}
          initialCity={city}
          categoryLabels={CATEGORY_LABELS}
        />
      </main>
    </div>
  );
}
