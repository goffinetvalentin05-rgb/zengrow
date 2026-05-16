import ReservationsDateSelector from "@/src/components/dashboard/reservations/toolbar/reservations-date-selector";
import ReservationsViewSwitcher from "@/src/components/dashboard/reservations/toolbar/reservations-view-switcher";

export default function ReservationsToolbar() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <ReservationsDateSelector />
      <ReservationsViewSwitcher />
    </div>
  );
}
