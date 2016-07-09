"use strict";

class Session
{
  constructor(name)
  {
    this.name = name;
    this.source = "XXX";
  }

  get running() { return false; }

  toJSON()
  {
    return {
      name: this.name,
      title: this.name,
      source: this.source,
      running: this.running,
    }
  }
}


module.exports = Session;
