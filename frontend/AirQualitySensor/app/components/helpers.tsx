// Default values (Can be changed at runtime)
type configType = {
  samplingRate: number;
  apiHost: string;
};

let config: configType = {
  samplingRate: 5000, // Default 5 seconds
  apiHost: "http://192.168.1.9",
};

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

export const fetchSensorData = async () => {
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
        Temperature: dht11Res.temperature,
        Humidity: dht11Res.humidity,
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
