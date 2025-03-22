#ifndef GLOBALS_H
#define GLOBALS_H

#include <ArduinoJson.h> 
#include <WiFi.h>
#include <MQUnifiedsensor.h>
#include <LiquidCrystal_I2C.h>
#include <DHT11.h>
#include "secrets.h"

// Board and Pin Definitions
#define Board "ESP-32"
#define Pin 34       // MQ135 Sensor Pin
#define Pin2 35      // MQ2 Sensor Pin
#define BuzzPin 23   // Buzzer Pin
#define DhtPin 32    // DHT11 Sensor Pin

// ADC Configuration
#define Voltage_Resolution 3.3
#define ADC_Bit_Resolution 12

// Display Configurations
#define DISPLAY_INTERVAL 880  // LCD update interval, add 200 of sampling freq
int lcdColumns = 16;
int lcdRows = 2;

// LCD Object
LiquidCrystal_I2C lcd(0x27, lcdColumns, lcdRows);

// Buzzer Constants
int MQ135_BUZZ_VALUE = 1500; // 1500 in lab3
int MQ2_BUZZ_VALUE = 1100;
int ENABLE_BUZZER = 0;
int ENABLE_SERIAL_DEBUG = 0;
// Sensor Objects
MQUnifiedsensor MQ135(Board, Voltage_Resolution, ADC_Bit_Resolution, Pin, "MQ-135");
MQUnifiedsensor MQ2(Board, Voltage_Resolution, ADC_Bit_Resolution, Pin2, "MQ-2");
DHT11 dht11(DhtPin);

// WiFi Credentials
// store these in file secrets.h
// WiFi Credentials
// const char* ssid = "abcd";
// const char* password = "1234";

#endif
