#include "FirebaseHelper.h"

// Returns UNIX epoch seconds as a String key.
// Ensures time is synced via NTP if not already.
String getTimestampKey() {
  time_t now = time(nullptr);
  if (now < 1700000000) { // rough guard to detect unsynced clock
    // TZ offets are handled by system config; we just need NTP
    configTime(0, 0, "pool.ntp.org", "time.google.com", "time.windows.com");
    // wait briefly for time sync
    for (int i = 0; i < 50 && time(nullptr) < 1700000000; i++) {
      delay(200);
    }
    now = time(nullptr);
  }
  // Fallback to millis if NTP still failed (very unlikely)
  if (now < 1700000000) {
    return String(millis());
  }
  return String((unsigned long)now);
}

// Reads MQ135, MQ2, DHT11, builds JSON, and stores it at /<basePath>/<ts>
bool pushAllSensorsToFirebase() {
  // Read sensor blocks
  JsonDocument mq135Doc = readALLMQ135();
  JsonDocument mq2Doc   = readALLMQ2();

  int temperature = 0, humidity = 0;
  readDHT(temperature, humidity);

  // Compose snapshot { mq135, mq2, dht }
  JsonDocument current_snapshot;
  current_snapshot["mq135"] = mq135Doc;       // clones content into snapshot
  current_snapshot["mq2"]   = mq2Doc;
  current_snapshot["dht"]["temperature"] = temperature;
  current_snapshot["dht"]["humidity"]    = humidity;

  // Serialize once
  String payload;
  serializeJson(current_snapshot, payload);

  // Path: /basePath/<timestamp>
  const String ts = getTimestampKey();
  const String path = Basepath + "/" + ts;

  int responseCode = fb.setJson(path, payload);
  Serial.print("Set JSON - Response Code: ");
  Serial.println(responseCode);

  if (responseCode == 200) {
    Serial.println("JSON data successfully sent to Firebase!");
    return true;
  }
  Serial.println("Failed to send JSON data to Firebase!");
  Serial.print("Response code ");
  Serial.print(responseCode);
  Serial.println(" indicates an error occurred.");
  return false; 
}
