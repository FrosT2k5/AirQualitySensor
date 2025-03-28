"use client";

import { fetchSensorData, sensorData, onlineState } from "~/helpers";
import type { Route } from "./+types/home";
import Dashboard from "~/components/Dashboard";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
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

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AirQualitySensor: Dashboard" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <Dashboard />;
}
