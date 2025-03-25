#include "globals.h"
#include "mq135.h"
#include "mq2.h"
#include "dht11.h"
#include "server.h"

unsigned long lastUpdate = 0;
int displayIndex = 0;

// Preferences Related Functions
void save_preferences() {
    Preferences preferences;
    preferences.begin("sensor_config", false);  // Namespace: "sensor_config", RW mode

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
    preferences.begin("sensor_config", true);  // Namespace: "sensor_config", Read-only mode

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




void setup() {
    Serial.begin(115200);
    lcd.init();
    lcd.backlight();

    // Load preferences on boot
    load_preferences();

    initMQ135();
    initMQ2();
    initDHT();

    // Initialize the server
    initServer();

    // Run calibration routines and update values
    // calcR0_MQ2();
    // calcR0_MQ135();
    // Call the dedicated endpoint "/calibrate" now to calibrate when needed

    pinMode(BuzzPin, OUTPUT);
    Serial.println("** Values from MQ-135 & MQ-2 **");
}

void loop() {
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

    // Process server requests
    WiFiClient client = server.available();
    if (client.connected()) {
      app.process(&client);
    }
    delay(200); // Sampling frequency
}
