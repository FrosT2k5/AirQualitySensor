"use client";

import HistoryDashboard, { HistoryDashboardFallback } from "~/components/HistoryDashboard";
import type { Route } from "./+types/history";
import { Await } from "react-router";
import React from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AirQualitySensor: Data History" },
    { name: "description", content: "Check the past sensor readings and Data" },
  ];
}

// export async function clientLoader({ params }: Route.ClientLoaderArgs) {
//   return fetch(
//     "https://airqualitysensor-cb6c8-default-rtdb.asia-southeast1.firebasedatabase.app/espData.json"
//   )
//     .then((resp) => {
//       if (!resp.ok) {
//         throw new Error("Failed to fetch sensor data");
//       }
//       return resp.json();
//     })
//     .catch((err) => {
//       console.error("Loader error:", err);
//       return false;
//     });
// }

export async function clientLoader({
  params,
}: Route.ClientLoaderArgs) {

  async function fetchFirebase() {
    try {
      const response = await fetch("https://airqualitysensor-cb6c8-default-rtdb.asia-southeast1.firebasedatabase.app/espData.json");
      if (!response.ok) {
        throw new Error("Failed to fetch sensor data");
      }
      const respJson = await response.json();
      return respJson;
    }
    catch {
      console.log("Error occured");
      return false;
    }
  }
  const responsePromise = fetchFirebase();
  return { responsePromise };
}

export default function History({ loaderData }: Route.ComponentProps) {
  const { responsePromise } = loaderData;

  return (
    <React.Suspense fallback={<HistoryDashboardFallback />}>
      <Await resolve={responsePromise}>
        {(value) => (<HistoryDashboard loaderData={value} />)}
      </Await>
    </React.Suspense>
  );
}
