# SToRM32 Droid Control

[![dependencies Status](https://david-dm.org/jpu/storm32-droid-control/status.svg)](https://david-dm.org/jpu/storm32-droid-control)

*Work in progress*

Android app for controlling a SToRM32 gimbal controller via Bluetooth. Built with Apache Cordova (PhoneGap).

Based on
[https://github.com/1oginov/Cordova-Bluetooth-Terminal](https://github.com/1oginov/Cordova-Bluetooth-Terminal)

## Quick Start

Make sure you have [cordova-cli](https://cordova.apache.org/) installed globally, install with the help of
[npm](https://www.npmjs.com/) otherwise:

```sh
$ npm install -g cordova
```

Clone repository, jump into, pull platforms (only **android** by default) and plugins: 

```sh
$ git clone https://github.com/jpu/storm32-droid-control.git
$ cd storm32-droid-control
$ cordova prepare
```

Also, you can check Cordova requirements (optional or is something failed):

```sh
$ cordova requirements
```

Build:

```sh
$ cordova build
```

Or run on connected Android device via USB:

```sh
$ cordova run
```

Emulator is useless here, because you need working bluetooth module.

## Used
* [BluetoothSerial](https://github.com/don/BluetoothSerial/) Cordova plugin
* [jQuery 3.1.1](https://jquery.com/)
* [Reset CSS](http://meyerweb.com/eric/tools/css/reset/)

## Tests

### Android APK

You can build and install an APK using [https://build.phonegap.com](https://build.phonegap.com)
without installing anything.

### Using a SToRM32 gimbal

#### Requirements
* Smartphone (tablet, etc)
* A SToRM32 controller board (tested using 1.32 board, on 0.96 software version)
* Bluetooth module (tested with HC-06)

Warning! This code is still work in progress, so try this first with your gimbal motors disabled (power using USB, not battery, or disconnect pitch & roll motors, for example).

Install the Bluetooth module on the SToRM32 board. Pair your phone with the module. Install the APK on your phone. Run the app. Things should be simple enough from there.

