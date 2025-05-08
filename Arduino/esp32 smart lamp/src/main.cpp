#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <ArduinoJson.h>

// GPIO pin for built-in LED
const int LED_BUILTIN_PIN = 2; // Built-in LED on most ESP32 boards

// BLE UUIDs provided by user
#define SERVICE_UUID "6b447bc4-70ac-4602-8a97-71bbcc14cde9"
#define LED_CHARACTERISTIC_UUID "9017bf83-2249-4f30-ae68-8a06b992a5aa"

// LED state
bool isLedOn = false;

// BLE Server
BLEServer *pServer = NULL;
BLECharacteristic *pLedCharacteristic = NULL;

bool deviceConnected = false;
bool oldDeviceConnected = false;

class MyServerCallbacks : public BLEServerCallbacks
{
  void onConnect(BLEServer *pServer)
  {
    deviceConnected = true;
    Serial.println("Device connected");
  }

  void onDisconnect(BLEServer *pServer)
  {
    deviceConnected = false;
    Serial.println("Device disconnected");
  }
};

class LedCharacteristicCallbacks : public BLECharacteristicCallbacks
{
  void onWrite(BLECharacteristic *pCharacteristic)
  {
    std::string value = pCharacteristic->getValue();

    if (value.length() > 0)
    {
      Serial.print("Received command: ");
      for (int i = 0; i < value.length(); i++)
      {
        Serial.print(value[i]);
      }
      Serial.println();

      // Parse JSON command
      DynamicJsonDocument doc(128);
      deserializeJson(doc, value);

      if (doc.containsKey("command"))
      {
        String command = doc["command"];

        if (command == "on")
        {
          isLedOn = true;
          digitalWrite(LED_BUILTIN_PIN, HIGH);
          Serial.println("LED turned ON");
          delay(3000); // 3 second delay as requested
        }
        else if (command == "off")
        {
          isLedOn = false;
          digitalWrite(LED_BUILTIN_PIN, LOW);
          Serial.println("LED turned OFF");
          delay(3000); // 3 second delay as requested
        }
      }

      // Update status characteristic
      updateLedStatus();
    }
  }

  void onRead(BLECharacteristic *pCharacteristic)
  {
    updateLedStatus();
  }
};

void updateLedStatus()
{
  DynamicJsonDocument doc(128);
  doc["isOn"] = isLedOn;

  String statusJson;
  serializeJson(doc, statusJson);

  pLedCharacteristic->setValue(statusJson.c_str());
  pLedCharacteristic->notify();
}

void setup()
{
  Serial.begin(115200);
  Serial.println("Starting BLE Server for ESP32 Built-in LED Control");

  // Configure LED pin
  pinMode(LED_BUILTIN_PIN, OUTPUT);

  // Initial state: LED off
  digitalWrite(LED_BUILTIN_PIN, LOW);

  // Create the BLE Device
  BLEDevice::init("ESP32-LED");

  // Create the BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create the BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Create BLE Characteristic
  pLedCharacteristic = pService->createCharacteristic(
      LED_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ |
          BLECharacteristic::PROPERTY_WRITE |
          BLECharacteristic::PROPERTY_NOTIFY);

  // Add descriptor
  pLedCharacteristic->addDescriptor(new BLE2902());

  // Set callbacks
  pLedCharacteristic->setCallbacks(new LedCharacteristicCallbacks());

  // Start service
  pService->start();

  // Start advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();
  Serial.println("BLE server ready. Waiting for connections...");
}

void loop()
{
  // Handle disconnection and reconnection
  if (!deviceConnected && oldDeviceConnected)
  {
    delay(500);                    // Give the Bluetooth stack time to get ready
    BLEDevice::startAdvertising(); // Restart advertising
    Serial.println("Started advertising");
    oldDeviceConnected = deviceConnected;
  }

  // Handle new connection
  if (deviceConnected && !oldDeviceConnected)
  {
    // Update characteristic with current status
    updateLedStatus();
    oldDeviceConnected = deviceConnected;
  }

  delay(100);
}
