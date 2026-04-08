import FeedbackForm from "@/src/components/reviews/feedback-form";
import { createAdminClient } from "@/src/lib/supabase/admin";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type FeedbackPageProps = {
  params: Promise<{ token: string }> | { token: string };
  searchParams: Promise<{ restaurantId?: string; rating?: string }> | { restaurantId?: string; rating?: string };
};

function initialRatingFromResponse(value: string | null): number {
  if (value === "a_ameliorer") return 2;
  if (value === "moyen") return 3;
  return 3;
}

function initialResponseLabel(value: string | null): string {
  if (value === "a_ameliorer") return "À améliorer";
  if (value === "moyen") return "Moyen";
  return "Votre retour";
}

export default async function FeedbackPage({ params, searchParams }: FeedbackPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const segment = resolvedParams.token;
  const legacyRestaurantId = resolvedSearchParams.restaurantId || "";
  const legacyRatingRaw = resolvedSearchParams.rating;
  const parsedLegacyRating = Number(legacyRatingRaw);
  const legacyInitialRating =
    Number.isInteger(parsedLegacyRating) && parsedLegacyRating >= 1 && parsedLegacyRating <= 5
      ? parsedLegacyRating
      : 3;

  try {
    const supabase = createAdminClient();

    const { data: byToken, error: tokenError } = await supabase
      .from("feedbacks")
      .select(
        "id, token, initial_response, responded_at, customer_name, customer_email, restaurant_id, reservation_id, restaurants ( name )",
      )
      .eq("token", segment)
      .maybeSingle();

    if (!tokenError && byToken) {
      if (byToken.responded_at) {
        return <InvalidFeedbackLink />;
      }

      const rel = byToken.restaurants as { name: string } | { name: string }[] | null;
      const restaurantName = Array.isArray(rel) ? (rel[0]?.name ?? "Restaurant") : (rel?.name ?? "Restaurant");

      return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,#ebf1ff_0,#f4f7fb_45%,#f4f7fb_100%)] px-4 py-10 md:py-16">
          <div className="mx-auto max-w-xl">
            <FeedbackForm
              variant="token"
              token={segment}
              restaurantName={restaurantName}
              initialRating={initialRatingFromResponse(byToken.initial_response)}
              initialResponseLabel={initialResponseLabel(byToken.initial_response)}
            />
          </div>
        </main>
      );
    }

    if (UUID_RE.test(segment)) {
      let reservationQuery = supabase
        .from("reservations")
        .select("guest_name, guest_email, restaurant_id")
        .eq("id", segment);

      if (legacyRestaurantId) {
        reservationQuery = reservationQuery.eq("restaurant_id", legacyRestaurantId);
      }

      const { data: reservation, error: reservationError } = await reservationQuery.maybeSingle();

      if (!reservationError && reservation) {
        return (
          <main className="min-h-screen bg-[radial-gradient(circle_at_top,#ebf1ff_0,#f4f7fb_45%,#f4f7fb_100%)] px-4 py-10 md:py-16">
            <div className="mx-auto max-w-xl">
              <FeedbackForm
                variant="legacy"
                reservationId={segment}
                restaurantId={reservation.restaurant_id}
                initialRating={legacyInitialRating}
                initialName={reservation.guest_name ?? ""}
                initialEmail={reservation.guest_email ?? ""}
              />
            </div>
          </main>
        );
      }
    }
  } catch (error) {
    console.error("Erreur page retour", error);
  }

  return <InvalidFeedbackLink />;
}

function InvalidFeedbackLink() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#ebf1ff_0,#f4f7fb_45%,#f4f7fb_100%)] px-4 py-10 md:py-16">
      <div className="mx-auto max-w-xl rounded-3xl border border-[var(--border)] bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Ce lien a déjà été utilisé ou est invalide.
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, merci de contacter le restaurant directement.
        </p>
      </div>
    </main>
  );
}
