"use client";
import React from "react";
import { ListaPedidos } from "./components/ListaPedidos";
import { AppShell } from "@/components/layout/AppShell";

export default function DashboardPage() {
return (
    <AppShell>
      <ListaPedidos />
    </AppShell>
)
}
