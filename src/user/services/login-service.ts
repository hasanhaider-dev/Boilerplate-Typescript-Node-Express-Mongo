import "reflect-metadata";
import Boom from "@hapi/boom";
import bcrypt from 'bcrypt';
import { StatusCodes } from "http-status-codes";
import Jwt from "jsonwebtoken";
import { Service, Inject } from "typedi";

import { ResponseModel, DbResponseModel } from "../../common/models";
import { UserModel } from '../../common/models/mongoose/user';
import { DatabaseService } from "../../common/services";
import config from "../../config";
import { logger } from "../../utils/logger";

@Service()
export class LoginService {
    @Inject()
    private databaseService: DatabaseService;

    public async login(requestBody: any): Promise<ResponseModel> {
        try {
            const response: ResponseModel = {
                hasError: false,
                message: "Success",
                payload: {},
                statusCode: StatusCodes.OK,
            };

            const userAccount = await this.getUser(requestBody.email);
            if (userAccount) {
                const isMatched = await bcrypt.compare(requestBody.password, userAccount.payload.password);

                if (isMatched)
                {
                    let token;
                    if (userAccount.payload.admin)
                    {
                        token = Jwt.sign(
                            { userId: userAccount.payload._id, email: userAccount.payload.email, admin: true },
                            config.credentials.tokenKey,
                            {
                                expiresIn: config.credentials.tokenExpiry
                            }
                        );
                    }
                    else {
                        token = Jwt.sign(
                            { userId: userAccount.payload._id, email: userAccount.payload.email, admin: false },
                            config.credentials.tokenKey,
                            {
                                expiresIn: config.credentials.tokenExpiry
                            }
                        );
                    }
                    response.payload = {token, message: "User successfully logged in"};
                }
                else {
                    response.hasError = true;
                    response.statusCode = StatusCodes.UNAUTHORIZED;
                    response.message = "Error";
                    response.payload = { message: "Incorrect Password" }
                }
            }
            else {
                response.hasError = true;
                response.statusCode = StatusCodes.UNAUTHORIZED;
                response.message = "Error";
                response.payload = { message: "No Such user exist in database" }
            }
            return response;
        } catch (err) {
            logger.error(
                `UserService.login: Error occured: ${err}`
            );
            throw Boom.internal();
        }
    }

    private async getUser(email: string): Promise<DbResponseModel> {
        const result = await this.databaseService.getSingleItem(UserModel, {email: email});
        if (result.success) {
            return result;
        } else if (result.error) {
            logger.error(
                `UserService.getUser: Error occured: ${result.error}`
            );
        }
    }
}
