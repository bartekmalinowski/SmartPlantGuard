/*
  SmartPlantGuard ESP32 Firmware - Final Version with Pump Safety Lock
*/

#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoOTA.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <EEPROM.h>
#include "secrets.h"

// --- EEPROM CONFIG ---
#define EEPROM_SIZE 20
#define ADDR_THRESHOLD 0
#define ADDR_DURATION 4
#define ADDR_MODE 8
#define ADDR_WATER_THRESHOLD 12

// --- USER CONFIG ---
const char* ssid = SECRET_SSID;
const char* password = SECRET_PASSWORD;

// --- SUPABASE CONFIG ---
const char* SUPABASE_URL = SECRET_SUPABASE_URL; 
const char* SUPABASE_ANON_KEY = SECRET_SUPABASE_ANON_KEY; 

// --- TIMING ---
unsigned long lastSendTime = 0;
const long SEND_INTERVAL = 21600000L; // 6 hours

// --- STATE CACHE (BUFFER) ---
float currentTempC = NAN;
float currentHumidity = 0.0;
float currentWaterLevelCm = -1.0;

// --- AUTOMATION VARIABLES ---
float soilHumidityThreshold;
long pumpRunDurationMs;
bool isSystemInAutoMode;
float waterLevelThresholdCm;

// --- STATE VARIABLES ---
unsigned long pumpStartTime = 0;
bool isAutoWateringCycleActive = false;
unsigned long autoWateringCooldownEnd = 0;
const long AUTO_WATERING_COOLDOWN_MS = 60 * 1000;
bool isManualWatering = false;
unsigned long manualPumpStartTime = 0;

// --- HARDWARE CONFIG ---
const uint8_t SOIL_MOISTURE_ANALOG_PIN = 34;
const int SOIL_MOISTURE_DRY_VALUE = 1200;
const int SOIL_MOISTURE_WET_VALUE = 800;
const uint8_t ONE_WIRE_BUS = 2;
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
const uint8_t PUMP1_PIN = 14; 
const bool PUMP_ACTIVE_LOW = true;
const uint8_t TRIG_PIN = 4;
const uint8_t ECHO_PIN = 5;

WebServer server(80);

// --- EEPROM FUNCTIONS ---
void saveSettings() {
  EEPROM.put(ADDR_THRESHOLD, soilHumidityThreshold);
  EEPROM.put(ADDR_DURATION, pumpRunDurationMs);
  EEPROM.put(ADDR_MODE, isSystemInAutoMode);
  EEPROM.put(ADDR_WATER_THRESHOLD, waterLevelThresholdCm);
  EEPROM.commit();
}

void loadSettings() {
  EEPROM.get(ADDR_THRESHOLD, soilHumidityThreshold);
  EEPROM.get(ADDR_DURATION, pumpRunDurationMs);
  EEPROM.get(ADDR_MODE, isSystemInAutoMode);
  EEPROM.get(ADDR_WATER_THRESHOLD, waterLevelThresholdCm);
  
  if (isnan(soilHumidityThreshold) || soilHumidityThreshold < 0 || soilHumidityThreshold > 100) soilHumidityThreshold = 30.0;
  if (pumpRunDurationMs <= 0 || pumpRunDurationMs > 60000) pumpRunDurationMs = 15000;
  if (isnan(waterLevelThresholdCm) || waterLevelThresholdCm < 0 || waterLevelThresholdCm > 50) waterLevelThresholdCm = 20.0;
}

// --- HELPER FUNCTIONS ---
void setPump(bool on) { digitalWrite(PUMP1_PIN, PUMP_ACTIVE_LOW ? (on ? LOW : HIGH) : (on ? HIGH : LOW)); }
bool getPumpState() { return PUMP_ACTIVE_LOW ? (digitalRead(PUMP1_PIN) == LOW) : (digitalRead(PUMP1_PIN) == HIGH); }
float getCachedTemperatureC() { return currentTempC; }
float getCachedSoilMoisture() { return currentHumidity; }
float getCachedWaterLevelCm() { return currentWaterLevelCm; }

float readWaterLevelCm() {
    digitalWrite(TRIG_PIN, LOW); delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);
    long duration = pulseIn(ECHO_PIN, HIGH, 30000);
    return (duration > 0) ? (duration * 0.034 / 2) : -1.0;
}

void performMeasurement() {
    sensors.requestTemperatures();
    float tempC = sensors.getTempCByIndex(0);
    currentTempC = (tempC == DEVICE_DISCONNECTED_C) ? NAN : tempC;
    int rawValue = analogRead(SOIL_MOISTURE_ANALOG_PIN);
    float humidity = map(rawValue, SOIL_MOISTURE_DRY_VALUE, SOIL_MOISTURE_WET_VALUE, 0, 100);
    currentHumidity = constrain(humidity, 0, 100);
    currentWaterLevelCm = readWaterLevelCm();
}

void sendDataToBackend(float tempC, float humidity, float waterLevelCm) {
    if (WiFi.status() != WL_CONNECTED) return;
    HTTPClient http;
    String fullUrl = String(SUPABASE_URL) + "/rest/v1/" + String(SUPABASE_TABLE_NAME);
    http.begin(fullUrl);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", SUPABASE_ANON_KEY); 
    String jsonPayload = "{\"temperature\":" + String(tempC, 2) + ",\"humidity\":" + String(humidity, 2) + ",\"water_level_cm\":" + String(waterLevelCm, 2) + "}";
    http.POST(jsonPayload);
    http.end();
}

// --- CORE LOGIC ---
void checkAndPerformLog() {
    if (millis() - lastSendTime >= SEND_INTERVAL) {
        performMeasurement(); 
        sendDataToBackend(currentTempC, currentHumidity, currentWaterLevelCm);
        if (isSystemInAutoMode) {
          manageAutoWatering(); 
        }
        lastSendTime = millis();
    }
}

void manageAutoWatering() {
    if (isAutoWateringCycleActive) {
        if (millis() - pumpStartTime >= pumpRunDurationMs) {
            setPump(false);
            isAutoWateringCycleActive = false;
            autoWateringCooldownEnd = millis() + AUTO_WATERING_COOLDOWN_MS; 
        }
        return;
    }
    if (millis() < autoWateringCooldownEnd) return; 

    if (currentHumidity < soilHumidityThreshold) {
        if (currentWaterLevelCm < 0 || currentWaterLevelCm > waterLevelThresholdCm) {
          return; 
        }
        isAutoWateringCycleActive = true;
        pumpStartTime = millis();
        setPump(true);
    }
}

void manageManualWatering() {
  if (isManualWatering) {
    if (millis() - manualPumpStartTime >= pumpRunDurationMs) {
      setPump(false);
      isManualWatering = false;
    }
  }
}

// --- API ENDPOINTS ---
String buildStatusJson() {
    bool isPumpSafetyLocked = (currentWaterLevelCm < 0 || currentWaterLevelCm > waterLevelThresholdCm);

    String json = "{";
    json += "\"soil_humidity\":" + String(getCachedSoilMoisture(), 1) + ",";
    json += "\"temperature\":" + (isnan(getCachedTemperatureC()) ? "null" : String(getCachedTemperatureC(), 1)) + ",";
    json += "\"water_level_cm\":" + String(getCachedWaterLevelCm(), 1) + ",";
    json += "\"pumpOn\":" + String(getPumpState() ? "true" : "false") + ",";
    json += "\"isAutoWateringCycleActive\":" + String(isAutoWateringCycleActive ? "true" : "false") + ",";
    json += "\"isPumpSafetyLockActive\":" + String(isPumpSafetyLocked ? "true" : "false") + ",";
    json += "\"systemMode\":\"" + String(isSystemInAutoMode ? "Auto" : "Manual") + "\",";
    json += "\"settings\": {";
    json += "\"humidityThreshold\":" + String(soilHumidityThreshold) + ",";
    json += "\"pumpDuration\":" + String(pumpRunDurationMs / 1000) + ",";
    json += "\"waterLevelThreshold\":" + String(waterLevelThresholdCm);
    json += "}}";
    return json;
}

void handleStatus() {
    server.send(200, "application/json", buildStatusJson());
}

void handleMeasureNow() {
    performMeasurement(); 
    if (isSystemInAutoMode) {
      manageAutoWatering(); 
    }
    sendDataToBackend(currentTempC, currentHumidity, currentWaterLevelCm);
    lastSendTime = millis();
    server.send(200, "application/json", buildStatusJson());
}

void handlePumpControl() {
    server.sendHeader("Access-Control-Allow-Origin", "*");

    if (isSystemInAutoMode || isAutoWateringCycleActive || isManualWatering) {
        server.send(403, "application/json", "{\"ok\":false,\"error\":\"System is in Auto mode or a watering cycle is active\"}");
        return;
    }
    
    if (currentWaterLevelCm < 0 || currentWaterLevelCm > waterLevelThresholdCm) {
        server.send(403, "application/json", "{\"ok\":false,\"error\":\"Water level too low to start pump\"}");
        return;
    }

    if (server.hasArg("s") && server.arg("s").toInt() == 1) {
        setPump(true);
        isManualWatering = true;
        manualPumpStartTime = millis();
        server.send(200, "application/json", "{\"ok\":true}");
    } else {
        server.send(400, "application/json", "{\"ok\":false}");
    }
}

void handleSetMode() {
  if (server.method() != HTTP_POST) return;
  
  JsonDocument doc;
  deserializeJson(doc, server.arg("plain"));
  
  if (doc.containsKey("mode")) {
    String mode = doc["mode"];
    isSystemInAutoMode = (mode == "Auto");
    saveSettings();
    server.send(200, "application/json", "{\"ok\":true}");
  } else {
    server.send(400, "application/json", "{\"ok\":false}");
  }
}

void handleSettings() {
  if (server.method() != HTTP_POST) return;

  JsonDocument doc;
  deserializeJson(doc, server.arg("plain"));

  if (doc.containsKey("humidityThreshold") && doc.containsKey("pumpDuration") && doc.containsKey("waterLevelThreshold")) {
    soilHumidityThreshold = doc["humidityThreshold"];
    pumpRunDurationMs = doc["pumpDuration"].as<long>() * 1000;
    waterLevelThresholdCm = doc["waterLevelThreshold"];
    saveSettings(); 
    server.send(200, "application/json", "{\"ok\":true}");
  } else {
    server.send(400, "application/json", "{\"ok\":false, \"error\":\"Missing parameters\"}");
  }
}

// --- SETUP & LOOP ---
void setup(){
    EEPROM.begin(EEPROM_SIZE);
    loadSettings();
    
    sensors.begin();
    pinMode(PUMP1_PIN, OUTPUT); 
    setPump(false);
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);

    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) { delay(500); }
    ArduinoOTA.setHostname("esp32-plantguard").begin();

    performMeasurement(); 

    server.onNotFound([]() {
      server.sendHeader("Access-Control-Allow-Origin", "*");
      if (server.method() == HTTP_OPTIONS) {
        server.sendHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
        server.send(204);
      } else {
        server.send(404, "text/plain", "Not Found");
      }
    });

    server.on("/api/status", HTTP_GET, [](){ server.sendHeader("Access-Control-Allow-Origin", "*"); handleStatus(); });
    server.on("/api/measure", HTTP_GET, [](){ server.sendHeader("Access-Control-Allow-Origin", "*"); handleMeasureNow(); });
    server.on("/api/pump", HTTP_GET, [](){ server.sendHeader("Access-Control-Allow-Origin", "*"); handlePumpControl(); });
    server.on("/api/settings", HTTP_POST, [](){ server.sendHeader("Access-Control-Allow-Origin", "*"); handleSettings(); });
    server.on("/api/set-mode", HTTP_POST, [](){ server.sendHeader("Access-Control-Allow-Origin", "*"); handleSetMode(); });
    
    server.begin();
}

void loop(){
    ArduinoOTA.handle();
    server.handleClient();
    checkAndPerformLog(); 
    manageManualWatering();
    delay(10);
}