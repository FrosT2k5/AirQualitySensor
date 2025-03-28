// Default values (Can be changed at runtime)
let config: configType = {
  samplingRate: 10000, // Default 5 seconds
  apiHost: "http://192.168.1.9",
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
  },
  isOnline: onlineState.loading,
}

type configType = {
  samplingRate: number;
  apiHost: string;
};

// Type declarations
type MQ135Data = {
  CO2: number;
  CO: number;
  Alcohol: number;
  Toluen?: number;
  NH4?: number;
  Aceton?: number;
  Raw?: number;
};

type MQ2Data = {
  H2?: number;
  LPG: number;
  CO: number;
  Alcohol?: number;
  Propane: number;
  Raw?: number;
};

type DHT11Data = {
  temperature: number;
  humidity: number;
};

type FullSensorResponse = {
  MQ135: MQ135Data,
  MQ2: MQ2Data,
  DHT11: DHT11Data,
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

// API Endpoints (Generated dynamically)
const getEndpoints = () => ({
  MQ135: `${config.apiHost}/mq135`,
  MQ2: `${config.apiHost}/mq2`,
  DHT: `${config.apiHost}/dht`,
  BUZZER: `${config.apiHost}/buzzer`,
  CONFIG: `${config.apiHost}/config`,
});

// Load settings from localStorage (Called on page load)
export const loadSettings = () => {
  const savedConfig = localStorage.getItem("appConfig");
  if (savedConfig) {
    config = JSON.parse(savedConfig); // Update config if found
  }
};

// Save settings to localStorage
export const saveSettings = () => {
  localStorage.setItem("appConfig", JSON.stringify(config));
};

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
      fullResponse: { MQ135: mq135Res, MQ2: mq2Res, DHT11: dht11Res },
    };
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    return null;
  }
};

// Exports
export { config, getEndpoints };
