"use client";

import { useEffect } from "react";
import { checkAndUpdateStreak } from "@/lib/store";

/** Runs once on dashboard load — checks streak, etc. */
export default function DashboardInit() {
  useEffect(() => {
    checkAndUpdateStreak();
  }, []);
  return null;
}
