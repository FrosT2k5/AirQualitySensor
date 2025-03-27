"use client";

import type { Route } from "./+types/home";
import Dashboard from "~/components/Dashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AirQualitySensor: Dashboard" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <Dashboard />;
}
