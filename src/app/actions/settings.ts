"use server";

import { createClient } from "~/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updatePassword(formData: FormData) {
    const supabase = await createClient();

    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
        return { error: "Passwords do not match." };
    }

    if (newPassword.length < 8) {
        return { error: "Password must be at least 8 characters." };
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
        return { error: error.message };
    }

    redirect("/?updated=1");
}
