import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function DashboardRouteGroupLayout({ children }: LayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
