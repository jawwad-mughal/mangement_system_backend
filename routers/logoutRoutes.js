import express from 'express'
import { logoutController } from '../controller/logoutController.js'

const router = express.Router()

router.post("/",logoutController)

export default router