#ifndef SERVER_H
#define SERVER_H

#include <aWOT.h>

// Just expose the server object here and a method to init server
void initServer();
WiFiServer server(80); // Run on port 80
Application app;

#endif