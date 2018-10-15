const EventEmitter = require('events');


class Hello extends EventEmitter {
    constructor () {
        super(1);
        this.x = 1;
    }
}



var a = new Hello ();
console.log(a.x);