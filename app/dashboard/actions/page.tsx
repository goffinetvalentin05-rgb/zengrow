import { redirect } from "next/navigation";
import { SHARPZ_ROUTES } from "@/src/lib/sharpz/routes";

export default function ActionsRedirect() {
  redirect(SHARPZ_ROUTES.dashboard);
}
