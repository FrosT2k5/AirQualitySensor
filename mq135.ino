#include "globals.h"
#include "mq135.h"

void initMQ135() {
    MQ135.setRegressionMethod(1);
    MQ135.init();
    MQ135.setR0(R0_MQ135/10);
}

float readCO() {
    MQ135.setA(605.18); MQ135.setB(-3.937);
    return MQ135.readSensor();
}

float readAlcohol() {
    MQ135.setA(77.255); MQ135.setB(-3.18);
    return MQ135.readSensor();
}

float readCO2() {
    MQ135.setA(110.47); MQ135.setB(-2.862);
    return MQ135.readSensor();
}

float readToluen() {
    MQ135.setA(44.947); MQ135.setB(-3.445);
    return MQ135.readSensor();
}

float readNH4() {
    MQ135.setA(102.2); MQ135.setB(-2.473);
    return MQ135.readSensor();
}

float readAceton() {
    MQ135.setA(34.668); MQ135.setB(-3.369);
    return MQ135.readSensor();
}

int rawMQ135() {
  int mq1Value = analogRead(Pin);
  return mq1Value;
}


JsonDocument readALLMQ135() {
    JsonDocument doc;

    MQ135.update();

    doc["CO"] = readCO();
    doc["Alcohol"] = readAlcohol();
    doc["CO2"] = readCO2();
    doc["Toluen"] = readToluen();
    doc["NH4"] = readNH4();
    doc["Aceton"] = readAceton();
    doc["Raw"] = rawMQ135();

    return doc;
}

// This function calculates the R0 value and prints it in serial console
void calcR0_MQ135() {
    float calcR0 = 0;

    for (int i = 1; i <= 10; i++) {
        MQ135.update();
        calcR0 += MQ135.calibrate(RatioMQ135CleanAir);
        Serial.print(".");
    }

    Serial.println();

    if (isinf(calcR0)) {
        Serial.println("Warning: MQ135 R0 is infinite (Open circuit detected). Check wiring!");
        while (1);
    }
    if (calcR0 == 0) {
        Serial.println("Warning: MQ135 R0 is zero (Short circuit detected). Check wiring!");
        while (1);
    }

    R0_MQ135 = calcR0/10;
    MQ135.setR0(R0_MQ135);
    Serial.println("Calibration done!");
    Serial.print("MQ135 R0: ");
    Serial.println(calcR0);

    // MQ135.serialDebug(true);
}
