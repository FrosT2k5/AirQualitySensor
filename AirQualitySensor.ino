#include "globals.h"
#include "mq135.h"
#include "mq2.h"
#include "dht11.h"
#include "server.h"

unsigned long lastUpdate = 0;
int displayIndex = 0;

void setup() {
    Serial.begin(115200);
    lcd.init();
    lcd.backlight();

    initMQ135();
    initMQ2();
    initDHT();

    // Initialize the server
    initServer();

    // Run calibration routines and update values
    calcR0_MQ2();
    calcR0_MQ135();

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

    if (mq1Value > MQ135_BUZZ_VALUE || mq2Value > MQ2_BUZZ_VALUE) {
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
