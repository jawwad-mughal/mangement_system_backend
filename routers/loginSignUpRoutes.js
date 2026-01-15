import express from 'express'
import { signupAdminController } from '../controller/signupAdminController.js';
import {loginController} from '../controller/loginController.js'

const router = express.Router()

router.post("/signup", signupAdminController)
router.post("/login", loginController)
// router.post("/forget",)

export default router;