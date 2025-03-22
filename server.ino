#include "server.h"
#include "mq135.h"
#include "mq2.h"
#include "dht11.h"

// API Server for reading sensor data and changing configuration

/* 
  Features to be implemented:
  X Get mq135
  Get mq2
  Get dht

  Get set buzzer state
  Get set calibration vals
*/

void get_MQ135(Request & req, Response & res) {
  res.set("Content-Type", "application/json");

  JsonDocument MQ1_Json = readALLMQ135();
  String response_json;

  serializeJson(MQ1_Json, response_json);

  res.print(response_json);
}

void get_MQ2(Request & req, Response & res) {
  res.set("Content-Type", "application/json");

  JsonDocument MQ2_Json = readALLMQ2();
  String response_json;

  serializeJson(MQ2_Json, response_json);

  res.print(response_json);
}

void initServer() {

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(WiFi.localIP());

  app.get("/mq135", &get_MQ135);
  app.get("/mq2", &get_MQ135);

  server.begin();
}