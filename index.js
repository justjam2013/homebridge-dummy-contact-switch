"use strict";

var Service, Characteristic, HomebridgeAPI;
const { HomebridgeDummySwitchControlledSensorVersion } = require('./package.json');

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  HomebridgeAPI = homebridge;
  homebridge.registerAccessory("homebridge-dummy-switch-controlled-sensor", "DummySwitchControlledSensor", DummySwitchControlledSensor);
};


function DummySwitchControlledSensor(log, config) {
  this.log = log;
  this.name = config.name;
  this.stateful = config.stateful;
  this.reverse = config.reverse;
  this.time = config.time ? config.time : 1000;
  this.timer = null;
  this.random = config.random;
  this.contactName = config.contactName || this.name;
  this.disableLogging = config.disableLogging;

  this._switch = new Service.Switch(this.name);
  this.modelString = "Dummy Switch";

  this.informationService = new Service.AccessoryInformation();
  this.informationService
      .setCharacteristic(Characteristic.Manufacturer, 'DummySwitchControlledSensor')
      .setCharacteristic(Characteristic.Model, this.modelString)
      .setCharacteristic(Characteristic.FirmwareRevision, HomebridgeDummySwitchControlledSensorVersion)
      .setCharacteristic(Characteristic.SerialNumber, '1234567890');

  this._contact = new Service.ContactSensor(this.contactName);

  this.cacheDirectory = HomebridgeAPI.user.persistPath();
  this.storage = require('node-persist');
  this.storage.initSync({
    dir: this.cacheDirectory,
    forgiveParseErrors: true
  });

  this._switch.getCharacteristic(Characteristic.On)
    .on('set', this._setOn.bind(this));

  if (this.reverse) this._switch.setCharacteristic(Characteristic.On, true);

  if (this.stateful) {
    var cachedState = this.storage.getItemSync(this.name);
    if ((cachedState === undefined) || (cachedState === false)) {
      this._switch.setCharacteristic(Characteristic.On, false);
      this._contact.setCharacteristic(Characteristic.ContactSensorState, 0);
    } else {
      this._switch.setCharacteristic(Characteristic.On, true);
      this._contact.setCharacteristic(Characteristic.ContactSensorState, 1);
    }
  }
}

DummySwitchControlledSensor.prototype.getServices = function() {
  return [this._switch, this._contact, this._informationService];
};

function randomize(time) {
  return Math.floor(Math.random() * (time + 1));
}

DummySwitchControlledSensor.prototype._setOn = function(on, callback, context) {

  var delay = this.random ? randomize(this.time) : this.time;
  var msg = "Setting switch to " + on
  if (this.random && !this.stateful) {
    if (on && !this.reverse || !on && this.reverse) {
      msg = msg + " (random delay " + delay + "ms)"
    }
  }
  if (!this.disableLogging) {
    this.log(msg);
  }

  if (on && !this.reverse && !this.stateful) {
    this.timerObject = setTimeout(function() {
      this._switch.setCharacteristic(Characteristic.On, false);
      this._contact.setCharacteristic(Characteristic.ContactSensorState, 0);
    }.bind(this), this.time);
  } else if (!on && this.reverse && !this.stateful) {
    this.timerObject = setTimeout(function() {
      this._switch.setCharacteristic(Characteristic.On, true);
      this._contact.setCharacteristic(Characteristic.ContactSensorState, 1);
    }.bind(this), this.time);
  }

  if (this.stateful) {
    this.storage.setItemSync(this.name, on);
  }

  this.state = on;
  callback();
};
