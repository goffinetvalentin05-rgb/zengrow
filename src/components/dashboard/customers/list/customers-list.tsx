"use client";

import CustomerListRow from "@/src/components/dashboard/customers/list/customer-list-row";
import {
  CustomersEmptyBase,
  CustomersEmptySearch,
} from "@/src/components/dashboard/customers/empty/customers-empty-states";
import { useCustomers } from "@/src/components/dashboard/customers/context/use-customers";

export default function CustomersList() {
  const { customers, filteredCustomers } = useCustomers();

  if (customers.length === 0) {
    return <CustomersEmptyBase />;
  }

  if (filteredCustomers.length === 0) {
    return <CustomersEmptySearch />;
  }

  return (
    <ul className="w-full min-w-0 space-y-2 md:space-y-2.5" role="list">
      {filteredCustomers.map((customer) => (
        <li key={customer.id}>
          <CustomerListRow customer={customer} />
        </li>
      ))}
    </ul>
  );
}
