"use client";

import { config, fetchBuzzerAndConfig, postBuzzerData, postConfigData, saveSettings } from "~/helpers";
import type { Route } from "./+types/settings";
import { SettingsPage, SettingsSkeleton } from "~/components/SettingsPage";
import { } from "../helpers";
import React from "react";
import { Await } from "react-router";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "AirQualitySensor: Settings" },
    { name: "description", content: "Setup your Air Quality Sensor!" },
  ];
}

export async function clientLoader({
  params,
}: Route.ClientLoaderArgs) {
  const responsePromise = fetchBuzzerAndConfig();
  return { responsePromise };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  let formData = await request.formData();

  // Parse data from form
  let internetMode = formData.get("internetMode") as string;
  if (internetMode === "true") {
    config.internetMode = true;

    saveSettings();
    return null;
  }

  let ipAddr = formData.get("ipAddr") as string;
  let samplingRate = Math.max(5000, Number(formData.get("samplingRate"))); // Ensure minimum 5,000
  let enableBuzzer = formData.get("enableBuzzer") as string;
  let MQ135_BUZZ_VALUE = Number(formData.get("MQ135_BUZZ_VALUE"));
  let MQ2_BUZZ_VALUE = Number(formData.get("MQ2_BUZZ_VALUE"));
  let ENABLE_SERIAL_DEBUG = formData.get("ENABLE_SERIAL_DEBUG") as string;
  let R0_MQ135 = Number(formData.get("R0_MQ135"));
  let R0_MQ2 = Number(formData.get("R0_MQ2"));

  // Call APIs one by one (sequentially)
  await postBuzzerData(enableBuzzer, MQ135_BUZZ_VALUE, MQ2_BUZZ_VALUE);
  await postConfigData(ENABLE_SERIAL_DEBUG, R0_MQ135, R0_MQ2);

  config.apiHost = ipAddr;
  config.samplingRate = samplingRate;
  config.internetMode = false;
  saveSettings();
  return null;
}

export default function Settings({
  loaderData,
}: Route.ComponentProps) {

  const { responsePromise } = loaderData;

  return (
    <React.Suspense fallback={<SettingsSkeleton />}>
    <Await resolve={responsePromise}>
      {(value) => (<SettingsPage loaderData={value} />)}
    </Await>
  </React.Suspense>
  );
}
