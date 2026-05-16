import {
  CUSTOMER_SEGMENT_BADGE_CLASS,
  CUSTOMER_SEGMENT_LABEL,
  getCustomerSegment,
  type CustomerSegment,
} from "@/src/components/dashboard/customers/utils/customer-segment";
import type { CustomerRecord } from "@/src/components/dashboard/customers/types";
import { cn } from "@/src/lib/utils";

type CustomerSegmentBadgeProps = {
  customer: CustomerRecord;
  segment?: CustomerSegment;
  className?: string;
};

export default function CustomerSegmentBadge({
  customer,
  segment,
  className,
}: CustomerSegmentBadgeProps) {
  const value = segment ?? getCustomerSegment(customer);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        CUSTOMER_SEGMENT_BADGE_CLASS[value],
        className,
      )}
    >
      {CUSTOMER_SEGMENT_LABEL[value]}
    </span>
  );
}
