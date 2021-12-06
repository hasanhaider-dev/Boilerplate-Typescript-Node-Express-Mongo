import * as Logger from "bunyan";

declare module 'express-serve-static-core' {
    interface Request {
        log: Logger;
    }
}
