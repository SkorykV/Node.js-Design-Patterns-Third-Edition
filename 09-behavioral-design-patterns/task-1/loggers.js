import fs from 'fs';
import { EOL } from 'os';

class Logger {
  constructor(loggingStrategy) {
    this.loggingStrategy = loggingStrategy;
  }
  debug(message) {
    this.loggingStrategy.log(`debug: ${message}`)
  }
  info(message) {
    this.loggingStrategy.log(`info: ${message}`)
  }
  warn(message) {
    this.loggingStrategy.log(`warn: ${message}`)
  }
  error(message) {
    this.loggingStrategy.log(`error: ${message}`)
  }
}

class LoggingStrategy {
  log(message) {
    throw new Error('not imlemented log method')
  }
}

class ConsoleStrategy extends LoggingStrategy {
  log(message) {
    console.log(message);
  }
}

class FileStrategy extends LoggingStrategy {
  constructor(filename) {
    super();
    this.writeStream = fs.createWriteStream(filename, {flags: 'a'})
  }

  log(message) {
    this.writeStream.write(message + EOL);
  }

  end() {
    this.writeStream.end();
  }
}


// testing

const str1 = new ConsoleStrategy();
const logger1 = new Logger(str1);
logger1.info('start execution');
logger1.error('error occurred');
logger1.info('finish execution');

const str2 = new FileStrategy('logs.txt');
const logger2 = new Logger(str2);
logger2.info('start execution');
logger2.error('error occurred');
logger2.info('finish execution');

//str2.end();