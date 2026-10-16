import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import StudentClientLayout from "./StudentClientLayout";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login?redirect=/student/home");
  }
  if (user.role !== "student" && user.role !== "admin") {
    redirect("/teacher/dashboard");
  }

  return <StudentClientLayout>{children}</StudentClientLayout>;
}
