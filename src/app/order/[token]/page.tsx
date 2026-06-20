"use client";

import { use } from "react";
import TableOrderPage from "@/features/table-order/TableOrderPage";

export default function OrderByTablePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  return <TableOrderPage token={token} />;
}
