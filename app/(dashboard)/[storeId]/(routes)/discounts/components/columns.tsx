"use client";

import { ColumnDef } from "@tanstack/react-table";

import { CellAction } from "./cell-action";

export type DiscountColumn = {
  id: string;
  name: string;
  percentage: string;
  isActive: boolean;
  productsCount: number;
  createdAt: string;
};

export const columns: ColumnDef<DiscountColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "percentage",
    header: "Percentage",
    cell: ({ row }) => <div>{row.original.percentage}%</div>,
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => <div>{row.original.isActive ? "Active" : "Inactive"}</div>,
  },
  {
    accessorKey: "productsCount",
    header: "Products",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];