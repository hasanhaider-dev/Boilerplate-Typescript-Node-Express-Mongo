import "reflect-metadata";
import { celebrate } from "celebrate";
import { Response, Request } from "express";
import { JsonController, Req, Res, Post, UseBefore } from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";
import { ResponseModel } from "src/common/models";
import { Inject } from "typedi";

import validationModel from '../models/validation-model';
import { UserService } from "../services";
import { LoginService } from "../services/login-service";

@JsonController("/user")
export class DefaultController {
  @Inject()
  private userService: UserService;
  @Inject()
  private loginService: LoginService;

  @Post("/create")
  @UseBefore(celebrate(validationModel.createAccountValidationModel))
  @OpenAPI({
      description:
      "Create User account",
      responses: {
          "400": {
              description: "Bad request, or validation errors",
          },
          "200": {
              description: "Success Response",
          },
      },
  })
  public async createUser(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<Response<ResponseModel>> {
      const result = await this.userService.createUser(req.body);
      return res.status(result.statusCode).send(result);
  }

  @Post("/login")
  @UseBefore(celebrate(validationModel.signInValidationModel))
  @OpenAPI({
      description:
      "Login User account",
      responses: {
          "400": {
              description: "Bad request, or validation errors",
          },
          "200": {
              description: "Success Response",
          },
      },
  })
  public async loginUser(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<Response<ResponseModel>> {
      const result = await this.loginService.login(req.body);
      return res.status(result.statusCode).send(result);
  }
}
