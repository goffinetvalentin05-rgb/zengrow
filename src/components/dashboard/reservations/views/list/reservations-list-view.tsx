import ReservationsDaySection from "@/src/components/dashboard/reservations/views/list/reservations-day-section";
import ReservationsUpcomingSection from "@/src/components/dashboard/reservations/views/list/reservations-upcoming-section";

export default function ReservationsListView() {
  return (
    <div className="space-y-10 md:space-y-12">
      <ReservationsDaySection />
      <ReservationsUpcomingSection />
    </div>
  );
}
