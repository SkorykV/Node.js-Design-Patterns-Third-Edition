import { Transform } from 'stream';

export class CrimesByArea extends Transform {
  constructor(opts = {}) {
    opts.objectMode = true;
    super(opts);
    this.infoByBorough = {};
  }

  _transform(chunk, _enc, cb) {
    const borough = chunk.borough;
    if(!this.infoByBorough[borough]) {
      this.infoByBorough[borough] = 0;
    }

    this.infoByBorough[borough] += (+chunk.value);
    cb();
  }

  _flush(done) {
    let bestBorough = null;
    let worstBorough = null;
    for(const borough in this.infoByBorough) {
      if(worstBorough === null || this.infoByBorough[borough] > this.infoByBorough[worstBorough]) {
        worstBorough = borough
      }
      if(bestBorough === null || this.infoByBorough[borough] < this.infoByBorough[bestBorough]) {
        bestBorough = borough;
      }
    }
    this.push(JSON.stringify({ bestBorough, worstBorough, bestBoroughCrimes: this.infoByBorough[bestBorough], worstBoroughCrimes: this.infoByBorough[worstBorough]}) + '\n');
    done();
  }
}