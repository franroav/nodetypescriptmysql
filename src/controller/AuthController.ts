import { getRepository } from "typeorm";
import { Request, Response } from "express";
import { User } from "../entity/User";
import * as jwt from "jsonwebtoken";
import config from "../config/config";
import { validate } from "class-validator";

class AuthController {
  static login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!(username && password)) {
      return res
        .status(400)
        .json({ message: "username && password are required" });
    }

    const userRepository = getRepository(User);
    let user: User;

    try {
      user = await userRepository.findOneOrFail({ where: { username } });
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Username or Password are incorrect" });
    }

    // check password
    if (!user.checkPassword(password)) {
      return res
        .status(400)
        .json({ message: " Username or Password are incorrect" });
    }

    const token = jwt.sign({ userId: user.id, username }, config.jwtSecret, {
      expiresIn: "1h",
    });

    res.json({ message: "OK", token });
  };

  static changePassword = async (req: Request, res: Response) => {
    const { userId } = res.locals.jwtPayload;
    const { oldPassword, newPassword } = req.body;
    if (!(oldPassword && newPassword)) {
      res
        .status(400)
        .json({ message: " Old Password & new password are required" });
    }
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(userId);
    } catch (error) {
      res.status(400).json({ message: "Something goes Wrong" });
    }
    if (!user.checkPassword(oldPassword)) {
      return res.status(401).json({ message: " check your old Password" });
    }
    user.password = newPassword;
    const validationUser = { validationError: { target: false, value: false } };
    const errors = await validate(user, validationUser);

    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    // hash password
    user.hashPassword();
    userRepository.save(user);

    res.json({ message: "Passwoord change" });
  };
}

export default AuthController;
