import ReviewGateForm from "@/src/components/reviews/review-gate-form";

type ReviewPageProps = {
  params: Promise<{ reservationId: string }>;
};

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { reservationId } = await params;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#ebf1ff_0,#f4f7fb_45%,#f4f7fb_100%)] px-4 py-10 md:py-16">
      <div className="mx-auto max-w-xl">
        <ReviewGateForm reservationId={reservationId} />
      </div>
    </main>
  );
}
