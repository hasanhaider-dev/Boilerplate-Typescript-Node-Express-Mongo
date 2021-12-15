import "reflect-metadata";
import Boom from "@hapi/boom";
import bcrypt from 'bcrypt';
import { StatusCodes } from "http-status-codes";
import { Service, Inject } from "typedi";

import { ResponseModel } from "../../common/models";
import {UserModel} from '../../common/models/mongoose/user';
import { DatabaseService } from "../../common/services";
import config from "../../config";
import { logger } from "../../utils/logger";

@Service()
export class UserService {
    @Inject()
    private databaseService: DatabaseService;

    public async createUser(requestBody: any): Promise<ResponseModel> {
        try {
            const response: ResponseModel = {
                hasError: false,
                message: "Success",
                payload: {},
                statusCode: StatusCodes.OK,
            };

            if (!(await this.checkIfUserExist(requestBody.email))) {
                const password = await this.getHashedPassword(requestBody.password);

                const user = {
                    ...requestBody,
                    password,
                }
                const result = await this.databaseService.addItem(
                    UserModel,
                    user
                );
                if (result.success) {
                    response.payload = { email: requestBody.email, message: "User successfully created" }
                }
            }

            else {
                response.hasError = true;
                response.statusCode = StatusCodes.BAD_GATEWAY;
                response.message = "Error";
                response.payload = { message: "User with this email already exist in database" }
            }
            return response;
        } catch (err) {
            logger.error(
                `UserService.createUser: Error occured: ${err}`
            );
            throw Boom.internal();
        }
    }

    private async checkIfUserExist(email: string): Promise<boolean> {
        try {
            const result = await this.databaseService.isExists(UserModel, {email: email});
            if (result.success) {
                return result.payload;
            } else if (result.error) {
                logger.error(
                    `UserService.checkIfUserExist: Error occured: ${result.error}`
                );
            }
        }
        catch (error)
        {
            logger.error(
                `UserService.checkIfUserExist: Error occured: ${error}`
            );
            throw Boom.internal();
        }
    }

    private async getHashedPassword(password: string): Promise<string>
    {
        const hashedPassword = await bcrypt.hash(password, config.credentials.passSalt);
        return hashedPassword;
    }
}
