"use client";

import HistoryDashboard from "~/components/HistoryDashboard";
import type { Route } from "./+types/history";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AirQualitySensor: Data History" },
    { name: "description", content: "Check the past sensor readings and Data" },
  ];
}

export default function About() {
  return <HistoryDashboard />;
}
