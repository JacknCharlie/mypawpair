import { ProviderSignUpForm } from "@/components/provider-sign-up-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-[#F6F2EA]">
      <div className="w-full max-w-sm">
        <ProviderSignUpForm />
      </div>
    </div>
  );
}
