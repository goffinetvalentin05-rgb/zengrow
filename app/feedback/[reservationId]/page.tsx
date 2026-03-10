import FeedbackForm from "@/src/components/reviews/feedback-form";
import { createAdminClient } from "@/src/lib/supabase/admin";

type FeedbackPageProps = {
  params: Promise<{ reservationId: string }> | { reservationId: string };
  searchParams: Promise<{ rating?: string; restaurantId?: string }> | { rating?: string; restaurantId?: string };
};

export default async function FeedbackPage({ params, searchParams }: FeedbackPageProps) {
  let reservationId = "";
  let restaurantId = "";
  let initialRating = 3;
  let initialName = "";
  let initialEmail = "";
  let isValidLink = false;

  try {
    const resolvedParams = await Promise.resolve(params);
    const resolvedSearchParams = await Promise.resolve(searchParams);
    reservationId = resolvedParams.reservationId;
    restaurantId = resolvedSearchParams.restaurantId || "";
    const { rating } = resolvedSearchParams;
    const parsedRating = Number(rating);
    initialRating = Number.isInteger(parsedRating) && parsedRating >= 1 && parsedRating <= 5 ? parsedRating : 3;
    const supabase = createAdminClient();
    const reservationQuery = supabase
      .from("reservations")
      .select("guest_name, guest_email, restaurant_id")
      .eq("id", reservationId);

    if (restaurantId) {
      reservationQuery.eq("restaurant_id", restaurantId);
    }

    const { data: reservation, error } = await reservationQuery.maybeSingle();

    if (!error && reservation) {
      initialName = reservation.guest_name ?? "";
      initialEmail = reservation.guest_email ?? "";
      restaurantId = reservation.restaurant_id;
      isValidLink = true;
    }
  } catch (error) {
    console.error("Feedback page error", error);
  }

  if (!isValidLink) {
    return <InvalidFeedbackLink />;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#ebf1ff_0,#f4f7fb_45%,#f4f7fb_100%)] px-4 py-10 md:py-16">
      <div className="mx-auto max-w-xl">
        <FeedbackForm
          reservationId={reservationId}
          restaurantId={restaurantId}
          initialRating={initialRating}
          initialName={initialName}
          initialEmail={initialEmail}
        />
      </div>
    </main>
  );
}

function InvalidFeedbackLink() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#ebf1ff_0,#f4f7fb_45%,#f4f7fb_100%)] px-4 py-10 md:py-16">
      <div className="mx-auto max-w-xl rounded-3xl border border-[var(--border)] bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">This feedback link is invalid.</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Merci de reouvrir le lien depuis l&apos;email recu.
        </p>
      </div>
    </main>
  );
}
