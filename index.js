"use strict";

var Service, Characteristic, HomebridgeAPI;
const { HomebridgeDummyVersion } = require('./package.json');

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
  this.contact = config['contact'] || false;
  this.contactName = config.contactName || this.name;
  this.time = config.time ? config.time : 1000;
  this.time = config.time ? config.time : 1000;		
  this.switch = config['switch'] || false;
  this.timerObject = null;
  this.debug = config['debug'] || false;
  this.serial = config["serial"] === undefined ? config["name"] : config["serial"];
  
	this._informationService = new Service.AccessoryInformation();
	this._informationService
			.setCharacteristic(Characteristic.Manufacturer, "DummySwitch")
			.setCharacteristic(Characteristic.Model, "DummySwitch")
			.setCharacteristic(Characteristic.SerialNumber, this.serial);


  if (this.switch) {
    this._service = new Service.Switch(this.name);
  } else {
    this._service = new Service.Lightbulb(this.name);
    this._service
      .addCharacteristic(Characteristic.Brightness);
  }

  this._contact = new Service.ContactSensor(this.contactName);

  this.cacheDirectory = HomebridgeAPI.user.persistPath();
  this.storage = require('node-persist');
  this.storage.initSync({
    dir: this.cacheDirectory,
    forgiveParseErrors: true
  });

  this._service.getCharacteristic(Characteristic.On)
    .on('set', this._setOn.bind(this));

  if (this.reverse) this._service.setCharacteristic(Characteristic.On, true);

  if (this.stateful) {
    var cachedState = this.storage.getItemSync(this.name);
    if ((cachedState === undefined) || (cachedState === false)) {
      this._service.setCharacteristic(Characteristic.On, false);
      this.state = false;
    } else {
      this._service.setCharacteristic(Characteristic.On, true);
      this.state = true;
    }
  }
}

DummySwitchControlledSensor.prototype.getServices = function() {
  if (this.contact) {
    return [this._service, this._contact, this._informationService];
  } else {
    return [this._service, this._informationService];
  }
};

DummySwitchControlledSensor.prototype._setOn = function(on, callback, context) {
  if (this.debug) {
  	this.log("Called to set switch to", on);
  }
  if (this.contact) {
    this._contact.setCharacteristic(Characteristic.ContactSensorState, (on ? 1 : 0));
  }

  if (this.state === on) {	
    this._service.getCharacteristic(Characteristic.On)
      .emit('change', {
        oldValue: on,
        newValue: on,
        context: context
      });
  } else {
	
	  this.log("Setting switch to", on);
	}

	if (on && !this.reverse && !this.stateful) {
		if (this.timerObject) {
			if (this.debug) {
				this.log("Called to set state to On again.  Resetting timerObject.");
			}
			clearTimeout(this.timerObject);
		} else {
			if (this.debug) {
				this.log("Called to set state to On again.  There is no timerObject.");
			}			
		}
		this.timerObject = setTimeout(function() {
			this._service.setCharacteristic(Characteristic.On, false);
			this._contact.setCharacteristic(Characteristic.ContactSensorState, 0);
		}.bind(this), this.time);
	} else if (!on && this.reverse && !this.stateful) {
		if (this.timerObject) {
			if (this.debug) {
				this.log("Called to set state to Off again.  Resetting timerObject.");
			}
			clearTimeout(this.timerObject);
		} else {
			if (this.debug) {
				this.log("Called to set state to Off again.  There is no timerObject.");
			}			
		}
		this.timerObject = setTimeout(function() {
			this._service.setCharacteristic(Characteristic.On, true);
			this._contact.setCharacteristic(Characteristic.ContactSensorState, 1);
		}.bind(this), this.time);
	}

  if (this.stateful) {
    this.storage.setItemSync(this.name, on);
  }

  this.state = on;
  callback();
};
