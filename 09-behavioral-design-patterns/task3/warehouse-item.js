const states = {
  arriving: 'arriving',
  stored: 'stored',
  delivered: 'delivered'
}

class WarehouseItem {
  constructor(id, state) {
    this.id = id;
    this.state = state;

    this._stateStrategies = {
    [states.arriving]: new ArrivingStateStrategy(this),
    [states.stored]: new StoredStateStrategy(this),
    [states.delivered]: new DeliveredStateStrategy(this)
  }
  }

  store(locationId) {
    this._stateStrategies[this.state].store(locationId);
  }

  deliver(address) {
    this._stateStrategies[this.state].deliver(address);
  }

  describe() {
    this._stateStrategies[this.state].describe();
  }

  setState(state) {
    this.state = state;
  }
}

class ItemStateStrategy {
  constructor(warehouseItem) {
    this.warehouseItem = warehouseItem;
  }

  store(locationId) {
    throw new Error('store method is not implemented')
  }

  deliver(address) {
    throw new Error('deliver method is not implemented')
  }

  describe() {
    throw new Error('describe method is not implemented')
  }

  setState(state) {
    this.state = state;
  }
}

class ArrivingStateStrategy extends ItemStateStrategy {
  store(locationId) {
    this.warehouseItem.setState(states.stored);
    this.warehouseItem.locationId = locationId;
  }

  deliver(address) {
    throw new Error(`Item ${this.warehouseItem.id} hasn\`t arrived yet`);
  }

  describe() {
    console.log(`Item ${this.warehouseItem.id} is on its way to the warehouse`);
  }
}

class StoredStateStrategy extends ItemStateStrategy {
  store(locationId) {
    throw new Error(`Item ${this.warehouseItem.id} is already stored in the location ${this.warehouseItem.locationId}`);
  }

  deliver(address) {
    this.warehouseItem.setState(states.delivered);
    this.warehouseItem.locationId = undefined;
    this.warehouseItem.deliveryAddress = address;
  }

  describe() {
    console.log(`Item ${this.warehouseItem.id} is stored in the location ${this.warehouseItem.locationId}`);
  }
}

class DeliveredStateStrategy extends ItemStateStrategy {
  store(locationId) {
    throw new Error(`Item ${this.warehouseItem.id} is already delivered to the address ${this.warehouseItem.deliveryAddress}`);
  }

  deliver(address) {
    throw new Error(`Item ${this.warehouseItem.id} is already delivered to the address ${this.warehouseItem.deliveryAddress}`);
  }

  describe() {
    console.log(`Item ${this.warehouseItem.id} was delivered to ${this.warehouseItem.deliveryAddress}`);
  }
}


const warehouseItem = new WarehouseItem(5821, states.arriving);
warehouseItem.describe();
warehouseItem.store('1ZH3');
warehouseItem.describe();
warehouseItem.deliver('Hohn Smith, 1st Avenue, New York');
warehouseItem.describe();