#include "server.h"
#include "mq135.h"
#include "mq2.h"
#include "dht11.h"

// API Server for reading sensor data and changing configuration

/* 
  Features to be implemented:
  X Get mq135
  X Get mq2
  X Get dht

  X Get set buzzer state
  X Get set calibration vals
  X Get set serial debugger
  X Calibrate sensors
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
  int is_updated = 0;
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
    is_updated = 1;
  }

  if (mq1_buzz_val_new) {
    Serial.println("New MQ135 Buzz Limit: " + (String) mq1_buzz_val_new);
    MQ135_BUZZ_VALUE = mq1_buzz_val_new;
    response_json["MQ135_BUZZ_VALUE"] = mq1_buzz_val_new;
    is_updated = 1;
  }

  if (mq2_buzz_val_new) {
    Serial.println("New MQ2 Buzz Limit: " + (String) mq2_buzz_val_new);
    MQ2_BUZZ_VALUE = mq2_buzz_val_new;
    response_json["MQ2_BUZZ_VALUE"] = mq2_buzz_val_new;
    is_updated = 1;
  }
  
    if (is_updated) {
      save_preferences();
    }
  serializeJson(response_json, response_json_serialized);
  res.print(response_json_serialized);
}

void get_buzzer(Request & req, Response & res) {
    res.set("Content-Type", "application/json");

    JsonDocument doc;
    doc["status"] = ENABLE_BUZZER;
    doc["MQ135_BUZZ_VALUE"] = MQ135_BUZZ_VALUE;
    doc["MQ2_BUZZ_VALUE"] = MQ2_BUZZ_VALUE;

    String response_json;
    serializeJson(doc, response_json);
    res.print(response_json);
}

void get_dht(Request & req, Response & res) {
    res.set("Content-Type", "application/json");

    int temperature = 0, humidity = 0;
    readDHT(temperature, humidity);  // Updates temperature and humidity

    JsonDocument doc;
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;

    String response_json;
    serializeJson(doc, response_json);
    res.print(response_json);
}

void get_config(Request & req, Response & res) {
    res.set("Content-Type", "application/json");

    JsonDocument doc;
    doc["ENABLE_SERIAL_DEBUG"] = ENABLE_SERIAL_DEBUG;
    doc["R0_MQ135"] = R0_MQ135;
    doc["R0_MQ2"] = R0_MQ2;

    String response_json;
    serializeJson(doc, response_json);
    res.print(response_json);
}

void update_config(Request & req, Response & res) {
    res.set("Content-Type", "application/json");

    JsonDocument doc;
    JsonDocument response_json;
    String response_json_serialized;
    int is_updated = 0;

    DeserializationError error = deserializeJson(doc, req);
    if (error) {
        Serial.print(F("deserializeJson() failed: "));
        Serial.println(error.f_str());
        response_json["status"] = "failed";
        serializeJson(response_json, response_json_serialized);
        res.print(response_json_serialized);
        return;
    }

    // Update values if present
    String debug_state_new = doc["ENABLE_SERIAL_DEBUG"];
    float r0_mq135_new = doc["R0_MQ135"];
    float r0_mq2_new = doc["R0_MQ2"];

    response_json["status"] = "success";

    if (debug_state_new == "enable" || debug_state_new == "disable") {
        ENABLE_SERIAL_DEBUG = 1 ? debug_state_new == "enable" : 0;
        Serial.println("Updated ENABLE_SERIAL_DEBUG: " + String(ENABLE_SERIAL_DEBUG));
        response_json["ENABLE_SERIAL_DEBUG"] = debug_state_new;
        is_updated = 1;
    }

    if (r0_mq135_new) {
        Serial.println("Updated R0_MQ135: " + String(r0_mq135_new));
        R0_MQ135 = r0_mq135_new;
        MQ135.setR0(R0_MQ135);
        response_json["R0_MQ135"] = r0_mq135_new;
        is_updated = 1;
    }

    if (r0_mq2_new) {
        Serial.println("Updated R0_MQ2: " + String(r0_mq2_new));
        R0_MQ2 = r0_mq2_new;
        MQ2.setR0(R0_MQ2);
        response_json["R0_MQ2"] = r0_mq2_new;
        is_updated = 1;
    }

    if (is_updated) {
      save_preferences();
    }

    serializeJson(response_json, response_json_serialized);
    res.print(response_json_serialized);
}

void calibrate_sensors(Request & req, Response & res) {
    res.set("Content-Type", "application/json");

    calcR0_MQ135();
    calcR0_MQ2();
    save_preferences();

    JsonDocument doc;
    doc["status"] = "success";
    doc["message"] = "Calibration completed and preferences saved.";
    doc["R0_MQ135"] = R0_MQ135;
    doc["R0_MQ2"] = R0_MQ2;

    String response_json;
    serializeJson(doc, response_json);
    res.print(response_json);
}

void initServer() {

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(WiFi.localIP());

  // Get IP Address
  String ipAddr = WiFi.localIP().toString();

  // Display IP Address on LCD for 2 seconds
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("IP Address:");
  lcd.setCursor(0, 1);
  lcd.print(ipAddr);
  delay(2000);  // Display for 2 seconds
  
  app.get("/mq135", &get_MQ135);
  app.get("/mq2", &get_MQ135);
  app.post("/buzzer", &update_buzzer);
  app.get("/buzzer", &get_buzzer);
  app.get("/dht", &get_dht);
  app.get("/config", &get_config);
  app.post("/config", &update_config);
  app.get("/calibrate", &calibrate_sensors);

  server.begin();
}