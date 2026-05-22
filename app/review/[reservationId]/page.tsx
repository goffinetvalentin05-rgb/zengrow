import ReviewGateForm from "@/src/components/reviews/review-gate-form";

type ReviewPageProps = {
  params: Promise<{ reservationId: string }>;
};

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { reservationId } = await params;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06040f] px-4 py-10 text-[#f4f0ff] md:py-16">
      <div className="mx-auto max-w-xl">
        <ReviewGateForm reservationId={reservationId} />
      </div>
    </main>
  );
}
