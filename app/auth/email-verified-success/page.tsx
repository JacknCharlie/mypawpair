import { Suspense } from "react";
import EmailVerifiedSuccessContent from "./email-verified-success-content";

export default function EmailVerifiedSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailVerifiedSuccessContent />
    </Suspense>
  );
}
