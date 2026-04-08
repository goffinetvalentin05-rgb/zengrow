import FeedbackForm from "@/src/components/reviews/feedback-form";
import { createClient } from "@/src/lib/supabase/server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type FeedbackPageProps = {
  params: Promise<{ token: string }> | { token: string };
  searchParams: Promise<{ restaurantId?: string; rating?: string }> | { restaurantId?: string; rating?: string };
};

function normalizeTokenSegment(raw: string): string {
  const t = raw.trim();
  try {
    return decodeURIComponent(t);
  } catch {
    return t;
  }
}

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
  const segment = normalizeTokenSegment(resolvedParams.token);
  const legacyRestaurantId = resolvedSearchParams.restaurantId || "";
  const legacyRatingRaw = resolvedSearchParams.rating;
  const parsedLegacyRating = Number(legacyRatingRaw);
  const legacyInitialRating =
    Number.isInteger(parsedLegacyRating) && parsedLegacyRating >= 1 && parsedLegacyRating <= 5
      ? parsedLegacyRating
      : 3;

  try {
    const supabase = await createClient();

    const { data: tokenRows, error: tokenRpcError } = await supabase.rpc("get_pending_feedback_by_token", {
      p_token: segment,
    });

    if (!tokenRpcError && tokenRows && tokenRows.length > 0) {
      const byToken = tokenRows[0] as {
        initial_response: string | null;
        restaurant_name: string | null;
      };

      const restaurantName = byToken.restaurant_name?.trim() || "Restaurant";

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
      const { data: resRows, error: reservationRpcError } = await supabase.rpc("get_reservation_for_public_feedback", {
        p_id: segment,
      });

      const reservation = resRows?.[0] as
        | { guest_name: string | null; guest_email: string | null; restaurant_id: string }
        | undefined;

      if (!reservationRpcError && reservation) {
        if (legacyRestaurantId && reservation.restaurant_id !== legacyRestaurantId) {
          return <InvalidFeedbackLink />;
        }

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
