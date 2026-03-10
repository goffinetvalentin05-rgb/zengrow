import FeedbackForm from "@/src/components/reviews/feedback-form";

type FeedbackPageProps = {
  params: Promise<{ reservationId: string }>;
  searchParams: Promise<{ rating?: string; restaurantId?: string }>;
};

export default async function FeedbackPage({ params, searchParams }: FeedbackPageProps) {
  const { reservationId } = await params;
  const { rating, restaurantId } = await searchParams;
  const parsedRating = Number(rating);
  const initialRating = Number.isInteger(parsedRating) && parsedRating >= 1 && parsedRating <= 5 ? parsedRating : 3;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#ebf1ff_0,#f4f7fb_45%,#f4f7fb_100%)] px-4 py-10 md:py-16">
      <div className="mx-auto max-w-xl">
        <FeedbackForm reservationId={reservationId} restaurantId={restaurantId ?? null} initialRating={initialRating} />
      </div>
    </main>
  );
}
