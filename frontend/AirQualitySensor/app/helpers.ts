"use client";

// Default values (Can be changed at runtime)
let initialConfig: configType = {
  samplingRate: 10000, // Default 5 seconds
  apiHost: "192.168.106.182",
  internetMode: true, // default to internet mode
};

let config: configType = initialConfig;

// Load settings from localStorage (Called on page load)
export const loadSettings = () => {
  const savedConfig = window.localStorage.getItem("appConfig");
  if (savedConfig) {
    config = JSON.parse(savedConfig);
  } else {
    config = initialConfig;
  }
};

// Save settings to localStorage
export const saveSettings = () => {
  window.localStorage.setItem("appConfig", JSON.stringify(config));
};

export enum onlineState {
  loading = "Loading",
  online = "Online",
  offline = "Offline" 
}

export let sensorData: sensorDataStateType = {
  MQ135: [],
  MQ2: [],
  DHT11: [],
  rawData: {
    MQ135: { CO2: 0, CO: 0, Alcohol: 0},
    MQ2: { LPG: 0, Propane: 0, CO: 0},
    DHT11: { temperature: 0, humidity: 0},
    score: 0
  },
  isOnline: onlineState.loading,
}

type configType = {
  samplingRate: number;
  apiHost: string;
  internetMode: boolean;
};

// Type declarations
export type MQ135Data = {
  CO2: number;
  CO: number;
  Alcohol: number;
  Toluen?: number;
  NH4?: number;
  Aceton?: number;
  Raw?: number;
};

export type MQ2Data = {
  H2?: number;
  LPG: number;
  CO: number;
  Alcohol?: number;
  Propane: number;
  Raw?: number;
};

export type DHT11Data = {
  temperature: number;
  humidity: number;
};

export type FullSensorResponse = {
  MQ135: MQ135Data,
  MQ2: MQ2Data,
  DHT11: DHT11Data,
  score: number,
}

export type SensorData = {
  name: string; // Timestamp
} & (MQ135Data | MQ2Data | DHT11Data);

export type sensorDataStateType = {
  MQ135: SensorData[];
  MQ2: SensorData[];
  DHT11: SensorData[];
  rawData: FullSensorResponse;
  isOnline: onlineState
}

// Type for the `/buzzer` endpoint response
export type BuzzerData = {
  status: number;
  MQ135_BUZZ_VALUE: number;
  MQ2_BUZZ_VALUE: number;
};

// Type for the `/config` endpoint response
export type ConfigData = {
  ENABLE_SERIAL_DEBUG: number;
  R0_MQ135: number;
  R0_MQ2: number;
};

export type BuzzerConfigResponse = {
  buzzer: BuzzerData;
  config: ConfigData;
  internetMode: boolean;
};

export type InternetConfigResponse = {
  internetMode: boolean;
  buzzer: null;
  config: null;
}

// API Endpoints (Generated dynamically)
const getEndpoints = () => ({
  MQ135: `http://${config.apiHost}/mq135`,
  MQ2: `http://${config.apiHost}/mq2`,
  DHT: `http://${config.apiHost}/dht`,
  BUZZER: `http://${config.apiHost}/buzzer`,
  CONFIG: `http://${config.apiHost}/config`,
  CALIBRATE: `http://${config.apiHost}/calibrate`,
});

// Update API host dynamically
export const setApiHost = (newHost: string) => {
  config.apiHost = newHost;
  saveSettings();
};

// Update sampling rate dynamically
export const setSamplingRate = (rate: number) => {
  config.samplingRate = rate;
  saveSettings();
};

export const fetchSensorData = async (): Promise<{
  MQ135: MQ135Data;
  MQ2: MQ2Data;
  DHT11: DHT11Data;
  fullResponse: FullSensorResponse;
} | null> => {
  try {
    const endpoints = {
      MQ135: getEndpoints()["MQ135"],
      MQ2: getEndpoints()["MQ2"],
      DHT11: getEndpoints()["DHT"],
    };

    // Fetch each sensor's data one at a time
    const mq135Res = await fetch(endpoints.MQ135).then((res) => res.json());
    await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay

    const mq2Res = await fetch(endpoints.MQ2).then((res) => res.json());
    await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay

    const dht11Res = await fetch(endpoints.DHT11).then((res) => res.json());

    return {
      MQ135: {
        CO2: mq135Res.CO2,
        CO: mq135Res.CO,
        Alcohol: mq135Res.Alcohol,
      },
      MQ2: {
        LPG: mq2Res.LPG,
        CO: mq2Res.CO,
        Propane: mq2Res.Butane,
      },
      DHT11: {
        temperature: dht11Res.temperature,
        humidity: dht11Res.humidity,
      },
      fullResponse: { MQ135: mq135Res, MQ2: mq2Res, DHT11: dht11Res, score: 0 },
    };
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    return null;
  }
};

export const fetchBuzzerAndConfig = async (): Promise<BuzzerConfigResponse | InternetConfigResponse | null> => {
  try {
    if (config.internetMode) {
      return {
        internetMode: true,
        buzzer: null,
        config: null,
      }
    }
    const buzzerRes = await fetch(getEndpoints()["BUZZER"]);
    const buzzerData: BuzzerData = await buzzerRes.json();

    const configRes = await fetch(getEndpoints()["CONFIG"]);
    const configData: ConfigData = await configRes.json();

    return {
      buzzer: buzzerData,
      config: configData,
      internetMode: false,
    };
  } catch (error) {
    console.error("Error fetching buzzer/config data:", error);
    return null;
  }
};

export async function postBuzzerData(state: string, MQ135_BUZZ_VALUE: number, MQ2_BUZZ_VALUE: number) {
  const buzzerData = {
    state,
    MQ135_BUZZ_VALUE,
    MQ2_BUZZ_VALUE
  };

  try {
    const response = await fetch(getEndpoints()["BUZZER"], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buzzerData),
    });

    return await response.json();
  } catch (error) {
    console.error("Error posting buzzer data:", error);
    return null;
  }
}

export async function postConfigData(ENABLE_SERIAL_DEBUG: string, R0_MQ135: number, R0_MQ2: number) {
  const configData = {
    ENABLE_SERIAL_DEBUG,
    R0_MQ135,
    R0_MQ2
  };

  try {
    const response = await fetch(getEndpoints()["CONFIG"], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(configData),
    });

    return await response.json();
  } catch (error) {
    console.error("Error posting config data:", error);
    return null;
  }
}

export async function calibrateRequest() {
  try {
    const response = await fetch(getEndpoints()["CALIBRATE"], {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return await response.json();
  } catch (error) {
    console.error("Error posting config data:", error);
    return null;
  }
}


// Exports
export { config, getEndpoints };
