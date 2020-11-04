import { UserController } from "./../controller/UserController";
import { Router } from "express";
import { checkJwt } from "../middleware/jwt";
import { checkRole } from "../middleware/role";

const router = Router();

//Get all users
router.get("/", [checkJwt, checkRole(["admin"])], UserController.getAll);

// get one user
router.get("/:id", [checkJwt, checkRole(["admin"])], UserController.getById);

// create a new User
router.post("/", [checkJwt, checkRole(["admin"])], UserController.newUser);

// Edit user
router.patch("/:id", [checkJwt, checkRole(["admin"])], UserController.editUser);

// Delete

router.delete(
  "/:id",
  [checkJwt, checkRole(["admin"])],
  UserController.deleteUser
);

export default router;
