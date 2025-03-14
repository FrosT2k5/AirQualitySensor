#include "globals.h"
#include "dht11.h"

void initDHT() {
    // Initialization logic for DHT11
}

void readDHT(int &temperature, int &humidity) {
    int result = dht11.readTemperatureHumidity(temperature, humidity);
    if (result != 0) {
        Serial.println(DHT11::getErrorString(result));
    }
}
