"use client";

import { useEffect } from "react";
import { createClient } from "~/lib/supabase/client";
import { api } from "~/trpc/react";

const supabase = createClient();

export function RealtimeSync() {
  const utils = api.useUtils();

  useEffect(() => {
    const channel = supabase
      .channel("admin-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public" },
        () => {
          // Invalidate everything in admin to keep the dashboard live
          void utils.invalidate();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [utils]);

  return null;
}
