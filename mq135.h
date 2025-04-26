#ifndef MQ135_H
#define MQ135_H

#define RatioMQ135CleanAir 3.6

void initMQ135();
float readCO();
float readAlcohol();
float readCO2();
float readToluen();
float readNH4();
float readAceton();
int rawMQ135();
void calcR0_MQ135();
JsonDocument readALLMQ135();
float R0_MQ135 = 2; // Calculated from calibration routine

#endif
