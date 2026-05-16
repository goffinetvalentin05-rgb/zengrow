import Link from "next/link";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";

export default function DashboardNotificationsPage() {
  return (
    <DashboardContent>
      <PageHeader
        title="Notifications"
        subtitle="Historique complet et filtres — disponible prochainement."
      />
      <p className="mt-6 text-sm text-zg-text-muted">
        Utilisez la cloche en haut à droite pour les dernières alertes. Cette page accueillera bientôt la liste
        paginée, les filtres et les actions groupées.
      </p>
      <Link href="/dashboard" className="mt-4 inline-block text-sm font-semibold text-zg-accent hover:text-zg-fg">
        Retour au tableau de bord
      </Link>
    </DashboardContent>
  );
}
