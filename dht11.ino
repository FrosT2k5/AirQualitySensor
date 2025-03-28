#include "globals.h"
#include "dht11.h"

void initDHT() {
}

void readDHT(int &temperature, int &humidity) {
    temperature = lastTemperature;
    humidity = lastHumidity;
}

