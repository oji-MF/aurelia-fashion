import { ProfileForm } from "@/components/account/profile-form";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <div>
      <h2 className="font-display text-2xl">Profile details</h2>
      <p className="mb-8 mt-2 text-sm text-stone">Keep your details up to date for a smoother checkout.</p>
      <ProfileForm user={user} />
    </div>
  );
}
