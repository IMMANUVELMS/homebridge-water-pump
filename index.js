"use strict";

var Service, Characteristic, HomebridgeAPI;

const httpreq = require("axios");


module.exports = function(homebridge) {

  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  HomebridgeAPI = homebridge;
  homebridge.registerAccessory("homebridge-water-pump", "WaterPump", WaterPump);
}



function WaterPump(log, config) {
  this.log = log;
  this.name = config.name;
  this.onLink = config.onLink;
  this.offLink = config.offLink;
  this.statusLink = config.statusLink;
  this.pumpName= config["pump_name"] || this.name;
  this.pumpState = 0;
  this.log("Starting a Water pump  with name '" + this.pumpName + "'...");

}
WaterPump.prototype.getPowerOn = function(callback) {
	
  httpreq.get(this.statusLink)
  .then(response => {

  if(response.data == "ON" || response.data == "1"){
		this.log("'%s' status is ON",this.pumpName);
		this.pumpState = 1;
		callback(null, this.pumpState);
	}else if(response.data == "OFF" || response.data == "0"){
		this.log("'%s' status is OFF",this.pumpName);
		this.pumpState = 0;
		callback(null, this.pumpState);
	}else{
		this.log("The TubeLight accessory returns Invalid data");
	}
		
   
  })
  .catch(error => {
    this.log("%s is unreachable",this.pumpName);
	callback(error);
  });	
  
  
}

WaterPump.prototype.setPowerOn = function(powerOn, callback) {
	
if(powerOn){	
	  httpreq.get(this.onLink)
	  .then(response => {
		if(response.data == "ON" || response.data == "1"){
		this.log("'%s' is set to ON",this.pumpName);
		this.pumpState = 1;
		callback(null);
	}
	  })
	  .catch(error => {
		this.log(error);
	  });}
  else{
	 httpreq.get(this.offLink)
  .then(response => {
     if(response.data == "OFF" || response.data == "0"){
		this.log("'%s' is set to OFF",this.pumpName);
		this.pumpState = 0;
		callback(null);
	}
  })
  .catch(error => {
    this.log("%s is unreachable",this.pumpName);
	callback(error);
  }); 
  }	
   
}

TubeLight.prototype.getServices = function() {
	this.service.getCharacteristic(Characteristic.ProgramMode).updateValue(0)
    this.service.getCharacteristic(Characteristic.Active).updateValue(1)
    this.service.getCharacteristic(Characteristic.InUse).updateValue(0)
    var pumpService = new Service.IrrigationSystem(this.name);
    
    pumpService
      .getCharacteristic(Characteristic.InUse)
      .on('get', this.getPowerOn.bind(this))
      .on('set', this.setPowerOn.bind(this));
    
    return [pumpService];
}

