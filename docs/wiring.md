# Wiring Standard

Uses B Standard wiring (normally)

| RJ45 Pin | RJ45B Colour | RJ45A Colour |Item | Notes | 
| --- | --- | --- | --- | --- |
| 1 | Brown | Brown | Key switch | | 
| 2 | Brown/White | Brown/White | Emergency Stop/ 3rd facepanel button | |
| 3 | Green | Orange | __Ground__  | | 
| 4 | Blue/White | Blue/White | GO Button | |
| 5 | Blue | Blue | 3rd LED | *Often to indicate key swtiched/power on power* | 
| 6 | Green/White | Orange/White | ACK Button | | 
| 7 | Orange | Green | Red LED | |
| 8 | Orange/White | Green/White | Green LED | *+ Yellow when key is off on certain units* |

Minimum wires per outstation = 5 (3,4,6,7,8). 4 channels can therefore in theory be crammed onto an Arduino Uno

**N.B.** Take note of the pins used by the Ethernet Hat on the networked version, as these can't also be used. This is on digital pins 10, 11, 12, and 13 on the Uno and pins 50, 51, and 52 on the Mega