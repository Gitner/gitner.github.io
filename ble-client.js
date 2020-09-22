class GateBLE {
  constructor() {
    this.device = null;
    this.up = null;
    this.down = null;
    this.onDisconnected = this.onDisconnected.bind(this);
  }

  /* the UP characteristic providing up capability */
  async setUpCharacteristic() {
    const service = await this.device.gatt.getPrimaryService(0xfff0);
    const UPcharacteristic = await service.getCharacteristic(
      "d7e84cb2-ff37-4afc-9ed8-5577aeb8454c"
    );
    const DWNcharacteristic = await service.getCharacteristic(
      "d7e84cb2-ff37-4afc-9ed8-5577aeb8454d"
    );
    this.up = UPcharacteristic;
    this.down = DWNcharacteristic;
    
    await this.up.startNotifications();
    await this.down.startNotifications();

    this.up.addEventListener(
      "characteristicvaluechanged",
      handleUpStatusChanged
    );
    this.down.addEventListener(
      "characteristicvaluechanged",
      handleUpStatusChanged
    );
  }

  /* request connection to a gateBLE device */
  async request() {
    if (navigator.bluetooth == undefined) {
      alert("Sorry, Your device does not support Web BLE!");
      return;
    }
    this.device = await navigator.bluetooth.requestDevice({filters: [{services: [0xfff0]}]});
        
    if (!this.device) {
      throw "No device selected";
    }
    this.device.addEventListener("gattserverdisconnected", this.onDisconnected);
  }

  /* connect to device */
  async connect() {
    if (!this.device) {
      return Promise.reject("Device is not connected.");
    }
    await this.device.gatt.connect();
  }

  /* read UP state */
  async readUp() {
    await this.up.readValue();
  }
  
  /* change UP state */
  async writeUp(data) {
    await this.up.writeValue(Uint8Array.of(data));
    await this.readUp();
  }
  
  /* read DOWN state */
  async readDown() {
    await this.down.readValue();
  }

  /* change DOWN state */
  async writeDown(data) {
    await this.down.writeValue(Uint8Array.of(data));
    await this.readDown();
  }

  /* disconnect from peripheral */
  disconnect() {
    if (!this.device) {
      return Promise.reject("Device is not connected.");
    }
    return this.device.gatt.disconnect();
  }

  /* handler to run when device successfully disconnects */
  onDisconnected() {
    alert("Device is disconnected.");
    location.reload();
  }
}
