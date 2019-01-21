const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const { ipcRenderer } = require('electron');
window.$ = window.jQuery = require('jquery');

//      Serial
const remote = require('electron').remote;
var comPort = remote.getGlobal("comPort");
var browserWindow = remote.getCurrentWindow();
const persistentSettings = remote.require('electron-settings');
var lastHeardFromDevice = Date.now();
var online;
var portConnection;
var parser;
//      Selector
var selectorQueue = [];
//      Flashing
var flashCycleStatus = true;
var flash = [];
//      DIV Colour
function setOpacity(e, alpha) { //e = jQuery element, alpha = background-opacity
    b = e.css('backgroundColor');
    e.css('backgroundColor', 'rgba' + b.slice(b.indexOf('('), ( (b.match(/,/g).length == 2) ? -1 : b.lastIndexOf(',') - b.length) ) + ', '+alpha+')');
}

//      SHOWFILE
var path = require("path");
var defaultShowFile = {
    name: "untitled",
    channelConfig: {
        1: {
            enabled: true,
            label: "1"
        },
        2: {
            enabled: true,
            label: "2"
        },
3: {
    enabled: true,
        label: "3"
},
4: {
    enabled: true,
        label: "4"
}
}
};
var thisShowFile = defaultShowFile; //The showfile that is currently open - ie the working copy
function openShowfile(path) {
    fs.readFile(path, 'utf8', function (err, data) {
        if (err) return false;
        else {
            thisShowFile = JSON.parse(data);
            renderShowFile();
        }
    });
}
function renderShowFile() {
    browserWindow.setTitle("CueB Control | " + thisShowFile.name);
    if (thisShowFile.channelConfig) {
        $.each( thisShowFile.channelConfig, function( index, value ){
            $(".channelTitle[data-channel=" + index + "]").html(value.label);
            if (value['label'].length > 3) {
                $(".channelTitle[data-channel=" + index + "]").css("font-size","5vmin");
            }
            if (value.enabled != true) {
                $(".channelTitle[data-channel=" + index + "]").hide();
            };
        });

    }
    console.log(thisShowFile);
}

var showFile = persistentSettings.get('showFile');
var fs = require('fs');
if (showFile) {
    openShowfile(showFile['path']);
}
ipcRenderer.on('fileOpen', function(evt, msg) {
    if (msg.length == 1) {
        var filepath = msg[0];
        persistentSettings.set('showFile', {
            path: filepath,
        });
        openShowfile(filepath);
    }
});

ipcRenderer.on('fileSave', function(evt, msg) {
    thisShowFile.name = path.basename(msg);
    fs.writeFile(msg, JSON.stringify(thisShowFile), 'utf8', function(err) {
        if(err) {
            alert(err);
        } else {
            openShowfile(msg);
        }
    });
});
ipcRenderer.on('newFile', function(evt, msg) {
    thisShowFile = defaultShowFile; //Reset to the default basically
    renderShowFile();
});


$(document).ready(function () {
    if (comPort) {
        $(".warningTriangle").fadeOut();
        portConnection = new SerialPort(comPort, {
            baudRate: 115200,
            autoOpen:false
        });
        portConnection.on('close', function (data) {
            $("h6").fadeOut(function () {
                $(".warningTriangle").fadeIn();
            });
            online = false;
        });
        parser = portConnection.pipe(new Readline({ delimiter: '\n' }))
        parser.on('data', function (data) {
            recieveMessageOSC(data.replace(/\n|\r/g, ""));
        });
        function openConnection() {
            portConnection.open(function (err) {
                if (err) {
                    console.log('Error opening port: ', err.message)
                    online = false;
                } else {
                    online = true;
                }
            });
        }
        function recieveMessageOSC(output) {
            switch (output) {
                case "CUEBOK":
                    lastHeardFromDevice = Date.now();
                    if ($(".warningTriangle").is(":hidden") == false) {
                        $(".warningTriangle").fadeOut(function () {
                            $("h6").fadeIn();
                        });
                    }
                    online = true;
                    break;
                default:
                    var outputArray = output.split(",");
                    switch (outputArray[0]) {
                        /*
                        0 = Command
                        1 = Channel (0 if not a channel)
                        2 = Button id
                        3 = Status (0 = up, 1 = down)
                         */
                        case "BTNStatus": //This is for startup only really
                            if (outputArray[1] > 0) {
                                //This is an outstation button - these messages are normally delivered on startup
                                if (outputArray[2] == 4) { //Key
                                    if (outputArray[3] == 1) {
                                        $('.lockIcon[data-channel="' + outputArray[1] + '"]').hide(); //Lock icon
                                    } else {
                                        $('.lockIcon[data-channel="' + outputArray[1] + '"]').show(); //Lock icon
                                    }
                                } else if (outputArray[2] == 5) { //Btn3
                                    if (outputArray[3] == 1) {
                                        $('.thirdButton[data-channel="' + outputArray[1] + '"]').hide(); //Lock icon
                                    } else {
                                        $('.thirdButton[data-channel="' + outputArray[1] + '"]').show(); //Lock icon
                                    }
                                }
                            }
                            break;
                        case "LEDStatus":
                            var LEDSelector = false;
                            switch (parseInt(outputArray[1])) {
                                case 3:
                                    LEDSelector = '.standby[data-channel="1"]';
                                    break;
                                case 4:
                                    LEDSelector = '.go[data-channel="1"]';
                                    break;
                                case 22:
                                    LEDSelector = '.thirdLED[data-channel="1"]';
                                    break;
                                case 5:
                                    LEDSelector = '.standby[data-channel="2"]';
                                    break;
                                case 6:
                                    LEDSelector = '.go[data-channel="2"]';
                                    break;
                                case 25:
                                    LEDSelector = '.thirdLED[data-channel="2"]';
                                    break;
                                case 7:
                                    LEDSelector = '.standby[data-channel="3"]';
                                    break;
                                case 8:
                                    LEDSelector = '.go[data-channel="3"]';
                                    break;
                                case 28:
                                    LEDSelector = '.thirdLED[data-channel="3"]';
                                    break;
                                case 9:
                                    LEDSelector = '.standby[data-channel="4"]';
                                    break;
                                case 10:
                                    LEDSelector = '.go[data-channel="4"]';
                                    break;
                                case 31:
                                    LEDSelector = '.thirdLED[data-channel="5"]';
                                    break;
                                case 11:
                                    LEDSelector = '.go[data-channel="master"]';
                                    break;
                                case 32:
                                    LEDSelector = '.standby[data-channel="master"]';
                                    break;
                                case 13:
                                    LEDSelector = '.lockIcon[data-channel="1"]';
                                    break;
                                case 12:
                                    LEDSelector = '.thirdButton[data-channel="1"]';
                                    break;
                                case 15:
                                    LEDSelector = '.lockIcon[data-channel="2"]';
                                    break;
                                case 14:
                                    LEDSelector = '.thirdButton[data-channel="2"]';
                                    break;
                                case 17:
                                    LEDSelector = '.lockIcon[data-channel="3"]';
                                    break;
                                case 16:
                                    LEDSelector = '.thirdButton[data-channel="3"]';
                                    break;
                               case 19:
                                    LEDSelector = '.lockIcon[data-channel="4"]';
                                    break;
                                case 18:
                                    LEDSelector = '.thirdButton[data-channel="4"]';
                                    break;
                            }
                            if (LEDSelector) {
                                if (outputArray[2] == 1) {
                                    //Turned on
                                    $(LEDSelector).css("animation","");
                                    if ($(LEDSelector).css("background-color") && $(LEDSelector).css("background-color") != "rgba(0, 0, 0, 0)") {
                                        setOpacity($(LEDSelector), 1);
                                    } else {
                                        $(LEDSelector).show();
                                    }
                                } else if (outputArray[2] == 0) {
                                    //Turned off
                                    $(LEDSelector).css("animation","");
                                    if ($(LEDSelector).css("background-color") && $(LEDSelector).css("background-color") != "rgba(0, 0, 0, 0)") {
                                        setOpacity($(LEDSelector), 0.4);
                                    } else {
                                        $(LEDSelector).hide();
                                    }
                                } else {
                                    //It's a flash - atm only the red ones actually have to flash
                                    $(LEDSelector).css("animation","flashBackgroundRed " + (1/outputArray[2])*2 + "s linear infinite");
                                }
                            }
                            break;
                        default:
                            break;
                    }
            }
        }
        function sendMessageOSC(message) {
            if (online) {
                portConnection.write(message + "\n");
            }
        }
        window.setInterval(function(){
            if (lastHeardFromDevice < (Date.now()-11000) && online != true) { //If we've gone offline now
                if ($(".warningTriangle").is(":hidden")) {
                    $("h6").fadeOut(function () {
                        $(".warningTriangle").fadeIn();
                    });
                }
            }
            if (online != true) {
                //Attempt to re-connect to arduino and see how it goes
                openConnection();
            }
        }, 2000);
        window.setInterval(function(){
            sendMessageOSC("PING");
        }, 5000);

        $("td[data-channel]").mousedown(function () {
             if ($(this).data("buttonpin")) {
                  sendMessageOSC("BTNClick," + $(this).data("buttonpin"));
             } else if ($(this).hasClass("selector")) {
                 if ($(this).data("channel") == "master") {
                     setOpacity($(".selector[data-channel=master]"), 1);
                     selectorQueue.forEach(function(entry) {
                         setOpacity($(".selector[data-channel=" + entry + "]"), 0.4);
                         $(".go[data-channel=" + entry + "]").trigger('mousedown');
                     });
                 } else if (selectorQueue.includes($(this).data("channel"))) {
                     //remove element from queue
                     for(var i = selectorQueue.length - 1; i >= 0; i--) {
                         if(selectorQueue[i] === $(this).data("channel")) {
                             selectorQueue.splice(i, 1);
                         }
                     }

                     setOpacity($(".selector[data-channel=" + $(this).data("channel") + "]"), 0.4);
                 } else {
                     selectorQueue.push($(this).data("channel"));
                     setOpacity($(".selector[data-channel=" + $(this).data("channel") + "]"), 1);
                 }
             }

        });
        $("td[data-channel]").mouseup(function () {
            if ($(this).data("buttonpin")) {
                sendMessageOSC("BTNUnClick," + $(this).data("buttonpin"));
            }   else if ($(this).hasClass("selector")) {
                if ($(this).data("channel") == "master") {
                    selectorQueue.forEach(function (entry) {
                        $(".go[data-channel=" + entry + "]").trigger('mouseup');
                    });
                    selectorQueue = [];
                    setOpacity($(".selector[data-channel=master]"), 0.4);
                }
            }


        });


        openConnection(); //Actually open the connection to the arduino
    } else {
        online = false;
        $("h6").fadeOut(function () {
            $(".warningTriangle").fadeIn();
        });
        function sendMessageOSC(message) {
            return;
        }
    }
});
