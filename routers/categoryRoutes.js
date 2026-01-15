import express from 'express'
import { addCategory, deleteCategory, editCategory, getCategory } from '../controller/categoryController.js'

const router = express.Router()

router.post("/add", addCategory)
router.get("/get", getCategory)
router.put("/edit", editCategory)
router.delete("/delete", deleteCategory)

export default router