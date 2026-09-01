import { ProfileEditor } from "@/src/components/discovery/profile-editor";
import { requireOnboardedSession } from "@/src/lib/discovery/auth";
import { getCategories, getOwnedRelations } from "@/src/lib/discovery/queries";
import { createClient } from "@/src/lib/supabase/server";

export default async function MeEditPage() {
  const session = await requireOnboardedSession();
  const supabase = await createClient();
  const [categories, relations] = await Promise.all([
    getCategories(supabase),
    getOwnedRelations(supabase, session.profile.id),
  ]);

  return (
    <ProfileEditor
      userId={session.user.id}
      profile={session.profile}
      categories={categories}
      selectedCategoryIds={relations.categoryLinks.map((item) => item.category_id)}
      projects={relations.projects}
      socialLinks={relations.socialLinks}
      featuredContent={relations.featuredContent}
    />
  );
}
