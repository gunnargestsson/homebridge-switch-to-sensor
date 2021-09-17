import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { switch2sensorHomebridgePlatform } from './platform';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class Switch2sensorPlatformAccessory {
  private service: Service;
  private logging: boolean = this.platform.config.logging || false;
  private pushInterval: number = this.platform.config.pushInterval || 5000;
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
      .setCharacteristic(this.platform.Characteristic.Model, 'SwitchOnMotionSensor')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, '2021-04-11');

    // get the Switch service if it exists, otherwise create a new Switch service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(accessory.context.device.name + ' Switch') ||
      this.accessory.addService(this.platform.Service.Switch, accessory.context.device.name + ' Switch',
        accessory.context.device.UUID + ':switch');

    // set the service name, this is what is displayed as the default name on the Home app
    // in this switch2sensor we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name + ' Switch');

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Switch

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))
      .onGet(this.getOn.bind(this));

    const motionSensorOneService = this.accessory.getService(accessory.context.device.name + ' Sensor') ||
      this.accessory.addService(this.platform.Service.MotionSensor, accessory.context.device.name + ' Sensor',
        accessory.context.device.UUID + ':sensor');

    setInterval(() => {
      // push the new value to HomeKit
      motionSensorOneService.updateCharacteristic(this.platform.Characteristic.MotionDetected, this.switch2sensorStates.On);
      this.platform.log.debug('Triggering motionSensorService:', this.switch2sensorStates.On);
      if (this.switch2sensorStates.On) {
        if (this.logging) {
          this.platform.log.info('Set MotionDetected to true', accessory.context.device.name);
        } else {
          this.platform.log.debug('Set MotionDetected to true', accessory.context.device.name);
        }
        this.switch2sensorStates.On = false;
        this.service.updateCharacteristic(this.platform.Characteristic.On, this.switch2sensorStates.On);
      }
    }, this.pushInterval);
  }


  async setOn(value: CharacteristicValue) {
    this.switch2sensorStates.On = value as boolean;
    if (this.logging) {
      this.platform.log.info('Set Characteristic On ->', this.accessory.context.device.name, value);
    } else {
      this.platform.log.debug('Set Characteristic On ->', this.accessory.context.device.name, value);
    }
  }

  async getOn(): Promise<CharacteristicValue> {
    const isOn = this.switch2sensorStates.On;

    this.platform.log.debug('Get Characteristic On ->', isOn);

    return isOn;
  }

}
