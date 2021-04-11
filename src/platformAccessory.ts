import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { switch2sensorHomebridgePlatform } from './platform';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class Switch2sensorPlatformAccessory {
  private service: Service;

  /**
   * These are just used to create a working switch2sensor
   * You should implement your own code to track the state of your accessory
   */
  private switch2sensorStates = {
    On: false,
  };

  constructor(
    private readonly platform: switch2sensorHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Navision.guru')
      .setCharacteristic(this.platform.Characteristic.Model, 'Switch2Sensor')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, '2021-04-11');

    // get the Switch service if it exists, otherwise create a new Switch service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this switch2sensor we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.switch2sensorDisplayName);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Switch

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))                // SET - bind to the `setOn` method below
      .onGet(this.getOn.bind(this));               // GET - bind to the `getOn` method below

    // Switch2sensor: add two "motion sensor" services to the accessory
    const motionSensorOneService = this.accessory.getService('Motion Sensor One') ||
      this.accessory.addService(this.platform.Service.MotionSensor, 'Motion Sensor One', 'hap-nodejs:accessories:sensor1');

    setInterval(() => {
      // push the new value to HomeKit
      motionSensorOneService.updateCharacteristic(this.platform.Characteristic.MotionDetected, this.switch2sensorStates.On);

      this.platform.log.debug('Triggering motionSensorOneService:', this.switch2sensorStates.On);
    }, 10000);
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for switch2sensor, turning on a Light bulb.
   */
  async setOn(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    this.switch2sensorStates.On = value as boolean;

    this.platform.log.debug('Set Characteristic On ->', value);
  }

  async getOn(): Promise<CharacteristicValue> {
    const isOn = this.switch2sensorStates.On;

    this.platform.log.debug('Get Characteristic On ->', isOn);

    return isOn;
  }

}