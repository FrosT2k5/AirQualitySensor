#include "globals.h"
#include "mq135.h"
#include "mq2.h"
#include "dht11.h"
#include "server.h"
#include "esp_task_wdt.h"

TaskHandle_t Task1_Handle;
TaskHandle_t Task2_Handle;

unsigned long lastUpdate = 0;
int displayIndex = 0;

// Preferences Related Functions
void save_preferences() {
    Preferences preferences;
    preferences.begin("sensor_config", false);  // RW mode

    preferences.putInt("MQ135_BUZZ", MQ135_BUZZ_VALUE);
    preferences.putInt("MQ2_BUZZ", MQ2_BUZZ_VALUE);
    preferences.putInt("ENABLE_BUZZER", ENABLE_BUZZER);
    preferences.putInt("SERIAL_DEBUG", ENABLE_SERIAL_DEBUG);
    preferences.putFloat("R0_MQ135", R0_MQ135);
    preferences.putFloat("R0_MQ2", R0_MQ2);

    preferences.end();
    Serial.println("Preferences saved!");
}

void load_preferences() {
    Preferences preferences;
    preferences.begin("sensor_config", true);  // Read-only mode

    MQ135_BUZZ_VALUE = preferences.getInt("MQ135_BUZZ", MQ135_BUZZ_VALUE);
    MQ2_BUZZ_VALUE = preferences.getInt("MQ2_BUZZ", MQ2_BUZZ_VALUE);
    ENABLE_BUZZER = preferences.getInt("ENABLE_BUZZER", ENABLE_BUZZER);
    ENABLE_SERIAL_DEBUG = preferences.getInt("SERIAL_DEBUG", ENABLE_SERIAL_DEBUG);
    R0_MQ135 = preferences.getFloat("R0_MQ135", R0_MQ135);
    R0_MQ2 = preferences.getFloat("R0_MQ2", R0_MQ2);
    MQ135.setR0(R0_MQ135);
    MQ2.setR0(R0_MQ2);
    preferences.end();

    Serial.println("Preferences loaded:");
    Serial.print("MQ135_BUZZ_VALUE: "); Serial.println(MQ135_BUZZ_VALUE);
    Serial.print("MQ2_BUZZ_VALUE: "); Serial.println(MQ2_BUZZ_VALUE);
    Serial.print("ENABLE_BUZZER: "); Serial.println(ENABLE_BUZZER);
    Serial.print("ENABLE_SERIAL_DEBUG: "); Serial.println(ENABLE_SERIAL_DEBUG);
    Serial.print("R0_MQ135: "); Serial.println(R0_MQ135);
    Serial.print("R0_MQ2: "); Serial.println(R0_MQ2);
}

// Task for Core 1 (Display, Buzzer, and Sensors)
void Task1_Core1(void *pvParameters) {
    while (true) {
        MQ135.update();
        MQ2.update();

        int temperature = 0, humidity = 0;
        readDHT(temperature, humidity);

        float CO = readCO();
        float Alcohol = readAlcohol();
        float CO2 = readCO2();
        float H2 = readH2();
        float LPG = readLPG();
        float CO_MQ2 = readCO_MQ2();
        float Alcohol_MQ2 = readAlcohol_MQ2();
        float Propane = readPropane();

        int mq1Value = rawMQ135();
        int mq2Value = rawMQ2();

        if (ENABLE_SERIAL_DEBUG) {
            Serial.print("CO2: "); Serial.print(CO2);
            Serial.print(" | Alcohol: "); Serial.print(Alcohol);
            Serial.print(" | CO: "); Serial.println(CO);
            Serial.print("H2: "); Serial.print(H2);
            Serial.print(" | LPG: "); Serial.print(LPG);
            Serial.print(" | CO_MQ2: "); Serial.print(CO_MQ2);
            Serial.print(" | Alcohol_MQ2: "); Serial.print(Alcohol_MQ2);
            Serial.print(" | Butane: "); Serial.println(Propane);

            Serial.print("MQ135 raw: "); Serial.println(mq1Value);
            Serial.print("MQ2 raw: "); Serial.println(mq2Value);

            Serial.print("Temperature: "); Serial.print(temperature);
            Serial.print(" | Humidity: "); Serial.println(humidity);
        }

        if (ENABLE_BUZZER && (mq1Value > MQ135_BUZZ_VALUE || mq2Value > MQ2_BUZZ_VALUE)) {
            digitalWrite(BuzzPin, HIGH);
        } else {
            digitalWrite(BuzzPin, LOW);
        }

        if (millis() - lastUpdate >= DISPLAY_INTERVAL) {
            lastUpdate = millis();
            lcd.clear();

            switch (displayIndex) {
                case 0:
                    lcd.setCursor(0, 0);
                    lcd.print("CO PPM: " + String(CO));
                    lcd.setCursor(0, 1);
                    lcd.print("Alcohol: " + String(Alcohol));
                    break;
                case 1:
                    lcd.setCursor(0, 0);
                    lcd.print("CO2 PPM: " + String(CO2));
                    lcd.setCursor(0, 1);
                    lcd.print("LPG: " + String(LPG));
                    break;
                case 2:
                    lcd.setCursor(0, 0);
                    lcd.print("H2 PPM: " + String(H2));
                    lcd.setCursor(0, 1);
                    lcd.print("Butane: " + String(CO_MQ2));
                    break;
                case 3:
                    lcd.setCursor(0, 0);
                    lcd.print("MQ135 raw: " + String(mq1Value));
                    lcd.setCursor(0, 1);
                    lcd.print("MQ2 raw: " + String(mq2Value));
                    break;
                case 4:
                    lcd.setCursor(0, 0);
                    lcd.print("Temp: " + String(temperature) + " C");
                    lcd.setCursor(0, 1);
                    lcd.print("Humid: " + String(humidity) + " %");
                    break;
            }
            displayIndex = (displayIndex + 1) % 5;
        }

        delay(200);
    }
}

// Task for Core 0 (WiFi & Server)
void Task2_Core0(void *pvParameters) {
  while (true) {
    WiFiClient client = server.available();
    if (client.connected()) {
        app.process(&client);
    }
    vTaskDelay( 500 / portTICK_PERIOD_MS);  
  }
}

// Read DHT 2 seconds, since dht has freq of 1hz (1s) and breaks when read concurrently
void Task_DHTReader(void *pvParameters) {
    dht.begin(); 

    while (true) {
        float temp = dht.readTemperature();
        float hum = dht.readHumidity();

        if (isnan(temp) || isnan(hum)) {
            Serial.println("❌ Failed to read from DHT sensor!");
        } else {
            lastTemperature = temp;
            lastHumidity = hum;
        }

        vTaskDelay(4000 / portTICK_PERIOD_MS);  // 4 seconds
    }
}

void setup() {
    Serial.begin(115200);
    lcd.init();
    lcd.backlight();

    load_preferences();

    initMQ135();
    initMQ2();
    initDHT();

    initServer();
    pinMode(BuzzPin, OUTPUT);
    Serial.println("** Values from MQ-135 & MQ-2 **");

    esp_task_wdt_config_t config = {
        .timeout_ms = 15 * 1000, // 10 seconds
        .idle_core_mask = (1 << CONFIG_FREERTOS_NUMBER_OF_CORES) - 1,
        .trigger_panic = true,
    };
    esp_task_wdt_reconfigure(&config);
    xTaskCreatePinnedToCore(Task1_Core1, "Task1", 10000, NULL, 1, &Task1_Handle, 1); // Core 1
    xTaskCreatePinnedToCore(Task_DHTReader, "DHTReader", 4000, NULL, 2, NULL, 1);  // Core 1
    xTaskCreatePinnedToCore(Task2_Core0, "Task2", 10000, NULL, 1, &Task2_Handle, 0); // Core 0
}

void loop() {
    vTaskDelete(NULL);
}