"use client";

import { memo, useCallback, useMemo } from "react";
import CustomerListRowActions from "@/src/components/dashboard/customers/list/customer-list-row-actions";
import CustomerSegmentBadge from "@/src/components/dashboard/customers/list/customer-segment-badge";
import { useCustomers } from "@/src/components/dashboard/customers/context/use-customers";
import ReservationsGuestAvatar from "@/src/components/dashboard/reservations/list-row/reservations-guest-avatar";
import type { CustomerRecord } from "@/src/components/dashboard/customers/types";
import {
  buildCustomerContactLine,
  buildCustomerMetadataLine,
} from "@/src/components/dashboard/customers/utils/format-customer-meta";
import { cn } from "@/src/lib/utils";
import { ChevronRight } from "lucide-react";

type CustomerListRowProps = {
  customer: CustomerRecord;
};

function CustomerListRow({ customer }: CustomerListRowProps) {
  const { openCustomerDetail, onEditCustomer } = useCustomers();

  const contactLine = useMemo(() => buildCustomerContactLine(customer), [customer]);
  const metadataLine = useMemo(() => buildCustomerMetadataLine(customer), [customer]);

  const onEmail = useCallback(() => {
    const email = customer.email?.trim();
    if (!email) return;
    window.location.href = `mailto:${email}`;
  }, [customer.email]);

  const onCall = useCallback(() => {
    const raw = customer.phone?.replace(/\s/g, "");
    if (!raw) return;
    window.location.href = `tel:${raw}`;
  }, [customer.phone]);

  const onEdit = useCallback(() => {
    onEditCustomer(customer.id);
  }, [customer.id, onEditCustomer]);

  const onOpenDetail = useCallback(() => {
    openCustomerDetail(customer.id);
  }, [customer.id, openCustomerDetail]);

  const actionHandlers = useMemo(
    () => ({ onEmail, onCall, onEdit }),
    [onEmail, onCall, onEdit],
  );

  return (
    <article
      className={cn(
        "group relative rounded-xl border border-zg-border bg-zg-surface transition-colors duration-150",
        "hover:border-zg-border-hover hover:bg-zg-accent/[0.05] md:hover:bg-zg-card-hover",
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3.5 sm:gap-4 sm:px-5">
        <button
          type="button"
          onClick={onOpenDetail}
          aria-label={`Ouvrir la fiche de ${customer.name}`}
          className="flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4"
        >
          <ReservationsGuestAvatar name={customer.name} size="md" variant="solid" />

          <span className="min-w-0 flex-1">
            <span className="flex min-w-0 items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-base font-semibold leading-snug text-zg-fg">
                {customer.name}
              </span>
              <CustomerSegmentBadge customer={customer} className="shrink-0" />
            </span>
            <span className="mt-1 block truncate text-sm text-zg-text-muted">{contactLine}</span>
            <span className="mt-0.5 block truncate text-sm text-zg-text-muted">{metadataLine}</span>
          </span>
        </button>

        <CustomerListRowActions customer={customer} handlers={actionHandlers} />

        <button
          type="button"
          onClick={onOpenDetail}
          aria-hidden
          tabIndex={-1}
          className="hidden shrink-0 rounded-lg p-1 text-zg-text-muted transition-colors hover:bg-zg-card-hover hover:text-zg-fg sm:block"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>
    </article>
  );
}

export default memo(CustomerListRow);
