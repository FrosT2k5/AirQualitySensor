"use client";

import { fetchSensorData, sensorData, onlineState, config, FIREBASE_ESP_URL } from "~/helpers";
import type { Route } from "./+types/home";
import Dashboard, { DashboardSkeleton } from "~/components/Dashboard";
import React, { type JSX } from "react";
import { Await } from "react-router";
import { airQualityScore } from "~/components/QualityScoreChart";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {

  async function updateSensorData() {
    if (config.internetMode) {
      try {
        const resp = await fetch(FIREBASE_ESP_URL);
        const json = await resp.json();
        sensorData.isOnline = onlineState.online;
        
        if (json && typeof json === "object") {
          const keys = Object.keys(json);
          const last15Keys = keys.slice(-15);
          const latestKey = keys[keys.length - 1];
          const latestData = json[latestKey];

          if (!sensorData.MQ135?.length) {
            // initialize with last 15 entries
            sensorData.MQ135 = last15Keys.map((ts) => ({
              name: new Date(Number(ts) * 1000).toLocaleTimeString(),
              ...json[ts].mq135,
            }));
            sensorData.MQ2 = last15Keys.map((ts) => ({
              name: new Date(Number(ts) * 1000).toLocaleTimeString(),
              ...json[ts].mq2,
            }));
            sensorData.DHT11 = last15Keys.map((ts) => ({
              name: new Date(Number(ts) * 1000).toLocaleTimeString(),
              ...json[ts].dht,
            }));
          } else {
            const lastEntryName =
              sensorData.MQ135[sensorData.MQ135.length - 1]?.name;
            const newName = new Date(Number(latestKey) * 1000).toLocaleTimeString();

            if (lastEntryName !== newName) {
              sensorData.MQ135 = [
                ...sensorData.MQ135.slice(-14),
                { name: newName, ...latestData.mq135 },
              ];
              sensorData.MQ2 = [
                ...sensorData.MQ2.slice(-14),
                { name: newName, ...latestData.mq2 },
              ];
              sensorData.DHT11 = [
                ...sensorData.DHT11.slice(-14),
                { name: newName, ...latestData.dht },
              ];
            }
          }

          // always set latest rawData snapshot
          sensorData.rawData = {
            MQ135: latestData.mq135,
            MQ2: latestData.mq2,
            DHT11: latestData.dht,
            score: 0,
          };
          const score = airQualityScore(sensorData.rawData, "average");
          sensorData.rawData.score = score;

          console.log(sensorData)
          sensorData.isOnline = onlineState.online;
        } else {
          sensorData.isOnline = onlineState.offline;
        }
      } catch (e) {
        console.error("Failed fetching Firebase data:", e);
        sensorData.isOnline = onlineState.offline;
      }
    } else {
      const data = await fetchSensorData();
      if (data) {
        sensorData.MQ135 = [
          ...sensorData.MQ135.slice(-14),
          { name: new Date().toLocaleTimeString(), ...data.MQ135 },
        ];
        sensorData.MQ2 = [
          ...sensorData.MQ2.slice(-14),
          { name: new Date().toLocaleTimeString(), ...data.MQ2 },
        ];
        sensorData.DHT11 = [
          ...sensorData.DHT11.slice(-14),
          { name: new Date().toLocaleTimeString(), ...data.DHT11 },
        ];
        sensorData.rawData = data.fullResponse;
        sensorData.rawData.score = airQualityScore(sensorData.rawData, "average");
        sensorData.isOnline = onlineState.online;
      } else {
        sensorData.isOnline = onlineState.offline;
      }
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
