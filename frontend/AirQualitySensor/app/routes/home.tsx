"use client";

import { fetchSensorData, sensorData, onlineState } from "~/helpers";
import type { Route } from "./+types/home";
import Dashboard, { DashboardSkeleton } from "~/components/Dashboard";
import React, { type JSX } from "react";
import { Await } from "react-router";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {

  async function updateSensorData() {
    const data = await fetchSensorData();
    
    if (data) {
      (sensorData.MQ135 = [
        ...sensorData.MQ135.slice(-14),
        { name: new Date().toLocaleTimeString(), ...data.MQ135 },
      ]),
        (sensorData.MQ2 = [
          ...sensorData.MQ2.slice(-14),
          { name: new Date().toLocaleTimeString(), ...data.MQ2 },
        ]),
        (sensorData.DHT11 = [
          ...sensorData.DHT11.slice(-14),
          { name: new Date().toLocaleTimeString(), ...data.DHT11 },
        ]),
        (sensorData.rawData = data.fullResponse);
      sensorData.isOnline = onlineState.online;
    } else {
      sensorData.isOnline = onlineState.offline;
    }
  }

  let resolveSensorData =  new Promise((res) => res(updateSensorData()));

  return { resolveSensorData };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AirQualitySensor: Dashboard" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps ) {

  let Fallback: ({}) => JSX.Element;
  let { resolveSensorData } = loaderData;
  const isDataPreloaded = sensorData.MQ135[0] ? true : false

  if (isDataPreloaded)
    Fallback = Dashboard;
  else 
    Fallback = DashboardSkeleton;

  return (
    <React.Suspense fallback={<Fallback />}>
      <Await resolve={resolveSensorData}>
        <Dashboard />
      </Await>
    </React.Suspense>
  );
}
