#ifndef MQ2_H
#define MQ2_H

#define RatioMQ2CleanAir 9.83

void initMQ2();
float readH2();
float readLPG();
float readCO_MQ2();
float readAlcohol_MQ2();
float readPropane();
int rawMQ2();
void calcR0_MQ2();
JsonDocument readALLMQ2();
float R0_MQ2 = 8.5; // Calculated from calibration routine


#endif
