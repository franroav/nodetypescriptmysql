import { getRepository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import { validate } from "class-validator";

export class UserController {
  static getAll = async (req: Request, res: Response) => {
    const userRepository = getRepository(User);
    let users;
    try {
      users = await userRepository.find();
    } catch (error) {
      res.status(404).json({ message: "Algo ha ido mal" });
    }

    if (users.length > 0) {
      res.send(users);
    } else {
    }
  };

  static getById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userRepository = getRepository(User);
    try {
      const user = await userRepository.findOneOrFail(id);
      res.send(user);
    } catch (error) {
      res.status(404).json({ message: "No Hay resultados" });
    }
  };

  static newUser = async (req: Request, res: Response) => {
    //destructuring el request del formulario
    const { username, password, role } = req.body;

    // instacio mi objeto del modelo usuario
    const user = new User();
    user.username = username;
    user.password = password;
    user.role = role;

    //validate
    const validationUser = {
      validationError: { target: false, value: false },
    };
    const errors = await validate(user, validationUser);
    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    // HASH PASSWORD

    const userRepository = getRepository(User);

    try {
      user.hashPassword();
      await userRepository.save(user);
    } catch (error) {
      return res.status(409).json({ message: "No Hay resultados" });
    }

    res.status(200).json({ message: "Usuario creado exitosamente!" });
  };

  static editUser = async (req: Request, res: Response) => {
    let user;
    const { id } = req.params;
    const { username, role } = req.body;

    const userRepository = getRepository(User);

    // try get user
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (error) {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = username;
    user.role = role;

    const validationUser = { validationError: { target: false, value: false } };
    const errors = await validate(user, validationUser);
    console.log("err", errors);

    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    // try to save user
    try {
      await userRepository.save(user);
    } catch (error) {
      res.status(409).json({ message: "User already exists" });
    }
    res.status(201).json({ message: "User update" });
  };

  static deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userRepository = getRepository(User);
    let user: User;

    try {
      user = await userRepository.findOneOrFail(id);
    } catch (error) {
      return res.status(404).json({ message: "User not found" });
    }

    userRepository.delete(id);
    res.status(201).json({ message: "User deleted" });
  };

  /*private userRepository = getRepository(User);

    async all(request: Request, response: Response, next: NextFunction) {
        return this.userRepository.find();
    }

    async one(request: Request, response: Response, next: NextFunction) {
        return this.userRepository.findOne(request.params.id);
    }

    async save(request: Request, response: Response, next: NextFunction) {
        return this.userRepository.save(request.body);
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        let userToRemove = await this.userRepository.findOne(request.params.id);
        await this.userRepository.remove(userToRemove);
    }*/
}

export default UserController;
