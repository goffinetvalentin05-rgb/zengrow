import FeedbackForm from "@/src/components/reviews/feedback-form";
import { createAdminClient } from "@/src/lib/supabase/admin";

type FeedbackPageProps = {
  params: Promise<{ reservationId: string }>;
  searchParams: Promise<{ rating?: string }>;
};

export default async function FeedbackPage({ params, searchParams }: FeedbackPageProps) {
  const { reservationId } = await params;
  const { rating } = await searchParams;
  const parsedRating = Number(rating);
  const initialRating = Number.isInteger(parsedRating) && parsedRating >= 1 && parsedRating <= 5 ? parsedRating : 3;
  const supabase = createAdminClient();

  const { data: reservation } = await supabase
    .from("reservations")
    .select("guest_name, guest_email")
    .eq("id", reservationId)
    .maybeSingle();

  if (!reservation) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#ebf1ff_0,#f4f7fb_45%,#f4f7fb_100%)] px-4 py-10 md:py-16">
        <div className="mx-auto max-w-xl rounded-3xl border border-[var(--border)] bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Lien invalide</h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Cette reservation est introuvable. Merci de reouvrir le lien depuis l&apos;email recu.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#ebf1ff_0,#f4f7fb_45%,#f4f7fb_100%)] px-4 py-10 md:py-16">
      <div className="mx-auto max-w-xl">
        <FeedbackForm
          reservationId={reservationId}
          initialRating={initialRating}
          initialName={reservation.guest_name ?? ""}
          initialEmail={reservation.guest_email ?? ""}
        />
      </div>
    </main>
  );
}
