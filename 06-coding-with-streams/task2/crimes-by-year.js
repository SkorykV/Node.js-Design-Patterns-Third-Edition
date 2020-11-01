import { Transform } from 'stream';

export class CrimesByYear extends Transform {
  constructor(opts = {}) {
    opts.objectMode = true;
    super(opts);
    this.infoByYear = {};
  }

  _transform(chunk, _enc, cb) {
    const year = +chunk.year;
    if(!this.infoByYear[year]) {
      this.infoByYear[year] = 0;
    }

    this.infoByYear[year] += (+chunk.value);
    cb();
  }

  _flush(done) {
    let bestYear = 2008;
    let worstYear = 2008;
    for(const year in this.infoByYear) {
      if(this.infoByYear[year] > this.infoByYear[worstYear]) {
        worstYear = year
      }
      else if(this.infoByYear[year] < this.infoByYear[bestYear]) {
        bestYear = year;
      }
    }
    this.push(JSON.stringify({ bestYear, worstYear, bestYearCrimes: this.infoByYear[bestYear], worstYearCrimes: this.infoByYear[worstYear]}) + '\n');
    done();
  }
}