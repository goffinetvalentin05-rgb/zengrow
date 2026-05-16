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

  return (
    <article
      className={cn(
        "group relative rounded-xl border border-zg-border bg-zg-surface transition-colors duration-150",
        "[content-visibility:auto] [contain-intrinsic-size:auto_5rem] sm:[contain-intrinsic-size:auto_6.5rem]",
        "active:bg-zg-card-hover md:hover:border-zg-border-hover md:hover:bg-zg-card-hover",
        "focus-within:border-zg-border-hover focus-within:bg-zg-card-hover",
      )}
    >
      <button
        type="button"
        onClick={onOpenDetail}
        aria-label={`Ouvrir la fiche de ${customer.name}`}
        className={cn(
          "grid w-full items-center gap-3 px-4 py-3.5 text-left",
          "grid-cols-[auto_minmax(0,1fr)_auto]",
          "sm:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] sm:gap-4 sm:px-5",
        )}
      >
        <ReservationsGuestAvatar name={customer.name} size="md" variant="solid" />

        <span className="min-w-0">
          <span className="flex min-w-0 items-start gap-2 sm:items-center">
            <span className="customer-row-name min-w-0 flex-1 truncate text-base font-semibold leading-snug text-zg-fg">
              {customer.name}
            </span>
            <CustomerSegmentBadge customer={customer} className="mt-0.5 sm:mt-0" />
          </span>
          <span className="mt-1 hidden truncate text-sm text-zg-text-muted sm:block">
            {contactLine}
          </span>
          <span className="mt-0.5 block truncate text-xs text-zg-text-muted sm:text-sm">
            {metadataLine}
          </span>
        </span>

        <ChevronRight
          className="h-5 w-5 shrink-0 text-zg-text-muted sm:order-last"
          strokeWidth={2}
          aria-hidden
        />

        <CustomerListRowActions
          customer={customer}
          handlers={{ onEmail, onCall, onEdit }}
          className="hidden sm:flex"
        />
      </button>

      <div
        className="flex items-center justify-end gap-1 border-t border-zg-border/60 px-3 py-2 sm:hidden"
        role="toolbar"
        aria-label={`Actions rapides pour ${customer.name}`}
      >
        <CustomerListRowActions
          customer={customer}
          handlers={{ onEmail, onCall, onEdit }}
        />
      </div>
    </article>
  );
}

export default memo(CustomerListRow);
