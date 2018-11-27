import * as winston from 'winston'
import {format} from 'winston'
import * as moment from 'moment-timezone'

const DailyRotateFile = require('winston-daily-rotate-file');


const {combine, timestamp, label, printf} = format
let baseDir = process.cwd()

class Logger {

    public logger: winston.Logger
    private fileLogOptions: Object = {
        level: typeof process.env['logLevel'] == 'undefined' ? 'info' : process.env['logLevel'],
        filename: 'OEMProvisioning-%DATE%.log',
        dirname: baseDir + '/logs',
        datePattern: 'YYYY-MM-DD',
        maxsize: '10m', //6MB
        maxFiles: '5d',
    }
    private consoleLogOptions = {
        level: typeof process.env['logLevel'] == 'undefined' ? 'info' : process.env['logLevel'],
        handleExceptions: true,
    }

    constructor() {
        this.logger = winston.createLogger({
            format: combine(
                format.splat(),
                label({label: ''}),
                appendTimestamp({tz: 'UTC'}),
                myFormat
            ),
            transports: [
                //    new winston.transports.File(this.fileLogOptions),
                new winston.transports.Console(this.consoleLogOptions),
                new DailyRotateFile(this.fileLogOptions)
            ],
            exitOnError: false
        });

    }

}

export class LoggerStream {
    write(message: string) {
        new Logger().logger.info(message.substring(0, message.lastIndexOf('\n')));
    }
}

const myFormat = printf(info => `${info.timestamp} [${info.level}]: ${info.label} - ${info.message}`);


const appendTimestamp = format((info, opts) => {
  //  if (opts.tz)
    let isUTC=typeof process.env['isUTCLog'] != "undefined" ? true : false
    if (isUTC)
        info.timestamp = moment(new Date()).tz('UTC').format('YYYY-MM-DD HH:mm:ss');  // FOR UTC
    else
        info.timestamp = moment(new Date()).utcOffset("+05:30").format('YYYY-MM-DD HH:mm:ss');  // FOR IST
return info;
});


export const logger = new Logger().logger