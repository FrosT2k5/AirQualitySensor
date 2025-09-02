#ifndef FIREBASEHELPER_H
#define FIREBASEHELPER_H

#include "mq2.h"
#include "mq135.h"
#include "dht11.h"
#include <Firebase.h>
#include <time.h>

// Define basepath for Firebase DB
const String Basepath = "espData";

// --- Declarations ---
String getTimestampKey();             // Returns unix timestamp
bool pushAllSensorsToFirebase();      // Push data to firebase 

// Firebase Object
Firebase fb(FIREBASE_REFERENCE_URL,   // Defined in secrets.h
        FIREBASE_AUTH_TOKEN);


// Frequency at which data is pushed into firebase
const int FIREBASE_SAMPLING_FREQUENCY = 30000; // 30 seconds

#endif