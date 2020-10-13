class GateBLE {
  constructor() {
    this.device = null;
    this.up = null;
    this.down = null;
    this.onDisconnected = this.onDisconnected.bind(this);
  }

  /* the GATE characteristic providing up capability */
  async setGateCharacteristic() {
    const service = await this.device.gatt.getPrimaryService(0xfff0);
    const GATEcharacteristic = await service.getCharacteristic(
      "d7e84cb2-ff37-4afc-9ed8-5577aeb8454c"
    );
    
    this.gate = GATEcharacteristic;
    
    await this.gate.startNotifications();
 
    /* check if gate state is changed */
    this.gate.addEventListener(
      "characteristicvaluechanged",
      handleGateStatusChanged
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

  /* read GATE state */
  async readGate() {
    return (await this.gate.readValue()).getUint8();
  }
  
  /* write GATE state */
  async writeGate(data) {
    await this.gate.writeValue(Uint8Array.of(data));
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
