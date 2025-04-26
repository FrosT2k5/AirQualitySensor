#include "globals.h"
#include "mq2.h"

void initMQ2() {
    MQ2.setRegressionMethod(1);
    MQ2.init();
    MQ2.setR0(R0_MQ2);
}

float readH2() {
    MQ2.setA(987.99); MQ2.setB(-2.162);
    return MQ2.readSensor();
}

float readLPG() {
    MQ2.setA(574.25); MQ2.setB(-2.222);
    return MQ2.readSensor();
}

float readCO_MQ2() {
    MQ2.setA(36974); MQ2.setB(-3.109);
    return MQ2.readSensor();
}

float readAlcohol_MQ2() {
    MQ2.setA(3616.1); MQ2.setB(-2.675);
    return MQ2.readSensor();
}

float readPropane() {
    MQ2.setA(658.71); MQ2.setB(-2.168);
    return MQ2.readSensor();
}

int rawMQ2() {
  int mq2Value = analogRead(Pin2);
  return mq2Value;
}

JsonDocument readALLMQ2() {
    JsonDocument doc;

    MQ2.update();

    doc["H2"] = readH2();
    doc["LPG"] = readLPG();
    doc["CO"] = readCO_MQ2();
    doc["Alcohol"] = readAlcohol_MQ2();
    doc["Butane"] = readPropane(); // Mark propane as butane
    doc["Raw"] = rawMQ2();

    return doc;
}


void calcR0_MQ2() {
    float calcR0_MQ2 = 0;

    for (int i = 1; i <= 10; i++) {
        MQ2.update();
        calcR0_MQ2 += MQ2.calibrate(RatioMQ2CleanAir);
        Serial.print(".");
    }

    Serial.println();

    if (isinf(calcR0_MQ2)) {
        Serial.println("Warning: MQ2 R0 is infinite (Open circuit detected). Check wiring!");
        while (1);
    }
    if (calcR0_MQ2 == 0) {
        Serial.println("Warning: MQ2 R0 is zero (Short circuit detected). Check wiring!");
        while (1);
    }

    R0_MQ2 = calcR0_MQ2/10;
    MQ2.setR0(R0_MQ2);
    Serial.print("MQ2 R0: ");
    Serial.println(calcR0_MQ2);

    // MQ2.serialDebug(true);
}