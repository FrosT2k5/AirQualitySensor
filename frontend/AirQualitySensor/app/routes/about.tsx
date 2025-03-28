"use client";

import type { Route } from "./+types/about";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AirQualitySensor: About Page" },
    { name: "description", content: "About the Developers" },
  ];
}

export default function About() {
  return <div>About Page</div>;
}
