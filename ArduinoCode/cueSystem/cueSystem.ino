// IMPORTS FOR TEMPERATURE SENSOR
#include <Wire.h>
#include <Adafruit_HTU21DF.h>

//  IMPORTS FOR SCREEN
#include <LiquidCrystal_I2C.h> //Include the exact library in a zip that's included with this project source

//  CONFIG
//      BUTTONS
/* Buttons List
 *  0 = Random button 1 - pin 12
 *  1 = Random button 2 - pin 13
 * 
 */
const byte buttonsCount = 3; //The number of buttons currently in existence
const byte buttonsPins[buttonsCount] = {10,11,12}; //The pins of each of the buttons currently in existence
const int buttonsDownState[buttonsCount] = {LOW,LOW,LOW}; //The state that the button is in when it's down (ie pressed)
//      LEDS
/* LED List
 *  0 = Random one for fun - pin 13
 * 
 */
const byte ledCount = 1; //The number of buttons currently in existence
const byte ledPins[ledCount] = {13}; //The pins of each of the buttons currently in existence


//  SETUP
//      TEMPERATURE
Adafruit_HTU21DF htu = Adafruit_HTU21DF();
//      SCREEN
LiquidCrystal_I2C lcd(0x3F, 2, 1, 0, 4, 5, 6, 7, 3, POSITIVE); //Be sure to run this screen at 5V - it's rubbish at 3.3V
//      BUTTONS
const unsigned long buttonsDebounceDelay = 50; // How long to do a debounce check for
unsigned long buttonsLastDebounceTime[buttonsCount]; //The last time each button was pressed
unsigned long buttonsHeldTime[buttonsCount]; //How long button has been held for
int buttonsState[buttonsCount];
int buttonsLastState[buttonsCount];



//  FUNCTIONS
//      BUTTONS
//      LIGHTS
//      SCREEN
bool writeToScreen(String text, int line) {
  if (line == 1) {
    lcd.setCursor(0,0);
    lcd.print("                "); //Clear that line of the display 
    lcd.setCursor(0,0);
  } else if (line == 2) {
    lcd.setCursor(0,1);
    lcd.print("                "); //Clear that line of the display 
    lcd.setCursor(0,1);
  } else {
    text = " LINE SET WRONG ";
  }
  
  if (text.length()>16) { //If string too long for system print an error
    text = "STRING TOO LONG ";
  }
  
  
  //
  lcd.print(text);
}
//      BUTTONS
//        Check state of all the buttons and update their debounce timers accordingly
void checkStateOfButtons() {
    int i;
    for (i = 0; i < buttonsCount; i = i + 1) {
      //Handle the debouncing stuff for that button
      if (digitalRead(buttonsPins[i]) != buttonsLastState[i]) {
        buttonsLastDebounceTime[i] = millis(); // reset the debouncing timer for that particular button
        buttonsLastState[i] = digitalRead(buttonsPins[i]);
      }

      //Handle if it's actually been pressed for that button
      if ((millis() - buttonsLastDebounceTime[i]) > buttonsDebounceDelay && digitalRead(buttonsPins[i]) != buttonsState[i]) {
         if (digitalRead(buttonsPins[i]) == buttonsDownState[i]) {
          buttonPressed(i); //Call a function if it's been pressed
          buttonsHeldTime[i] = millis(); //Track when it was pressed - so we can give an indication to the release function of how long it was held for
         } else {
          buttonReleased(i, (millis() - buttonsHeldTime[i])); //Call a function if it's been released
         }
         buttonsState[i] = digitalRead(buttonsPins[i]);
      }
    }
}
// Function called when a button is pressed
void buttonPressed(int i) {
  Serial.println(String(i) + " PRESSED");
  switch (i) {
    case 0:
      ledOn(0);
      break;
  }
}
// Function called when a button is released - it's expected this won't normally be used
void buttonReleased(int i, unsigned long holdTime) { //holdTime is how long the button was held for before being released in Milliseconds
  Serial.println(String(i) + " RELEASED | Hold time (ms): " + String(holdTime));
    switch (i) {
    case 0:
      ledOff(1);
      break;
  }
}
//      LEDs
void ledOn(int i) {
  digitalWrite(ledPins[i], HIGH);
}
void ledOff(int i) {
  digitalWrite(ledPins[i], LOW);
}


//  SETUP
void setup() {
  //    SERIAL
  Serial.begin(9600);
  Serial.println("BOOTING");
  //    SCREEN
  lcd.begin(16,2);          
  lcd.noAutoscroll();
  lcd.setBacklight(LOW); 
  lcd.home ();
  lcd.print("JBITHELL LOADING");
  lcd.home ();
  lcd.setBacklight(HIGH);
  //    TEMPERATURE SENSOR  
  if (!htu.begin()) {
    writeToScreen("Couldn't find sensor!",1);
    while (1);
  }
  //    BUTTONS
  //     Setup each of our buttons
  int i;
  for (i = 0; i < buttonsCount; i = i + 1) {
    pinMode(buttonsPins[i], INPUT_PULLUP);
    buttonsLastDebounceTime[i] = 0;
    buttonsLastState[i] = digitalRead(buttonsPins[i]);
    buttonsState[i] = digitalRead(buttonsPins[i]);
    buttonsHeldTime[i] = millis();
  }
  //    LEDs

  for (i = 0; i < ledCount; i = i + 1) {
    pinMode(ledPins[i], OUTPUT); //Setup the LED and then turn it off
    digitalWrite(ledPins[i], LOW); 
  }


  //    SETUP DONE
  Serial.println("BOOTED");
}


void loop() {
  checkStateOfButtons(); //Check and update the debounce timers for all our buttons

  
  //writeToScreen("Temp: " + (String(htu.readTemperature())), 1);
  //lcd.setCursor(0,1);
  //writeToScreen("Humid: " + (String(htu.readHumidity())), 2);
  //delay(500);
}
