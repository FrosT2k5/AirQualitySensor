"use client";

import AboutUs from "~/components/AboutUs";
import type { Route } from "./+types/about";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AirQualitySensor: About Page" },
    { name: "description", content: "About the Developers" },
  ];
}

export default function About() {
  return <AboutUs />;
}
