import { Request, Response, NextFunction } from "express";
import { renameSync } from "fs";
import * as jwt from "jsonwebtoken";
import config from "../config/config";

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  //console.log("req", req.headers);
  const token = <string>req.headers["auth"];
  let jwtPayload;

  try {
    jwtPayload = <any>jwt.verify(token, config.jwtSecret);
    res.locals.jwtPayload = jwtPayload;
  } catch (error) {
    return res.status(401).json({ message: "User Not Authorized" });
  }

  // console.log("req", jwtPayload);
  const { userId, username } = jwtPayload;
  // token
  const newtoken = jwt.sign({ userId, username }, config.jwtSecret, {
    expiresIn: "1h",
  });

  res.setHeader("token", newtoken);

  next();
};
