import express from 'express'
import { createEmployee, deleteEmployee, getAllEmployees, getSingleData, updateEmployee } from '../controller/addEmployeeController.js'
import { upload } from "../middleware/multerMiddleware.js"

const router = express.Router()

router.post("/add", upload.single("image"),createEmployee)
router.get("/get", getAllEmployees)
router.get("/getsingledata/:id", getSingleData)
router.delete("/delete/:id", deleteEmployee)
router.put("/update/:id",upload.single("image") ,updateEmployee)

export default router;