import { redirect } from "next/navigation";
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase/server";

export async function getEditor() {
  if (!hasSupabaseConfig()) return null;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: admin } = await supabase.from("admin_users").select("user_id, role").eq("user_id", user.id).maybeSingle();
  if (!admin) return null;
  return { user, role: admin.role };
}

export async function requireEditor() {
  const editor = await getEditor();
  if (!editor) redirect("/admin/login");
  return editor;
}

export async function getAdminVenues() {
  if (!hasSupabaseConfig()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("venues").select("id, name, address, neighbourhood, website_url, phone").order("name");
  return data ?? [];
}

export async function getAdminReviewList() {
  if (!hasSupabaseConfig()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("reviews").select("id, slug, status, visit_date, updated_at, overall_score, venue:venues(name)").order("updated_at", { ascending: false });
  return data ?? [];
}
