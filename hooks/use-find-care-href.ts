"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Returns /dashboard/admin if user is logged in as admin, otherwise /find-care.
 * Used for Find Care / Create Dog Profile buttons on homepage.
 */
export function useFindCareHref() {
  const [href, setHref] = useState("/find-care");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.role === "admin") setHref("/dashboard/admin");
        });
    });
  }, []);

  return href;
}
