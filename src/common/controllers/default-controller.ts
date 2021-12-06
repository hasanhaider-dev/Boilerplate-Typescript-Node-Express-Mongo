import "reflect-metadata";
import { celebrate } from "celebrate";
import { Response, Request } from "express";
import { JsonController, Req, Res, Get, Post, UseBefore, Body } from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";
import { Inject } from "typedi";

import { Authenticate } from "../middleware/authenticator";
import { ResponseModel } from '../models';
import validationSchema from '../models/validation-model';
import { DefaultService } from "../services";

@JsonController()
export class DefaultController {
    @Inject()
    private defaultService: DefaultService;

    @Get("/")
  @OpenAPI({
      description:
      "Health check controller to make sure that the app is running.",
      responses: {
          "400": {
              description: "Bad request",
          },
          "200": {
              description: "Success Response",
          },
      },
  })
    public healthCheck(
    @Req() req: Request,
    @Res() res: Response
    ): Response<ResponseModel<unknown>> {
        return res.send({ message: "Hello World from Boilerplate!!" });
    }

  @Post("/post")
  @UseBefore(Authenticate, celebrate(validationSchema))
  @OpenAPI({
      description:
      "Controller to accept payload after validation.",
      responses: {
          "400": {
              description: "Bad request",
          },
          "200": {
              description: "Success Response",
          },
      },
  })
    public post(
    @Req() req: Request,
    @Res() res: Response
    ): Response<ResponseModel<unknown>> {
        return res.send({ message: "Hello World from Boilerplate!!" });
    }
}
