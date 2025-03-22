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
  Get set serial debugger
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

void update_buzzer(Request & req, Response & res) {
  res.set("Content-Type", "application/json");

 // Allocate the JSON document
  JsonDocument doc;
  JsonDocument response_json;
  String response_json_serialized;

  // Deserialize the request to json document
  DeserializationError error = deserializeJson(doc, req);

  // Test if parsing succeeds.
  if (error) {
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.f_str());
    response_json["status"] = "failed";
    serializeJson(response_json, response_json_serialized);
    res.print(response_json_serialized);
    return;
  }

  String state = doc["state"];
  int mq1_buzz_val_new = doc["MQ135_BUZZ_VALUE"];
  int mq2_buzz_val_new = doc["MQ2_BUZZ_VALUE"];

  // Send status success on every request
  response_json["status"] = "success";

  // Check and update requested fields from JSON
  if (state == "enable" || state == "disable") {
    Serial.println("New Buzzer State: " + state);
    ENABLE_BUZZER = 1 ? state == "enable" : 0;
    response_json["state"] = ENABLE_BUZZER;
  }

  if (mq1_buzz_val_new) {
    Serial.println("New MQ135 Buzz Limit: " + (String) mq1_buzz_val_new);
    MQ135_BUZZ_VALUE = mq1_buzz_val_new;
    response_json["MQ135_BUZZ_VALUE"] = mq1_buzz_val_new;
  }

  if (mq2_buzz_val_new) {
    Serial.println("New MQ2 Buzz Limit: " + (String) mq2_buzz_val_new);
    MQ2_BUZZ_VALUE = mq2_buzz_val_new;
    response_json["MQ2_BUZZ_VALUE"] = mq2_buzz_val_new;
  }
  
  serializeJson(response_json, response_json_serialized);
  res.print(response_json_serialized);
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
  app.post("/buzzer", &update_buzzer);

  server.begin();
}