import express from "express"
import { createBranch, deleteBranch, fetchBranch, getAllBranch, getSingle, updateBranch } from "../controller/branchController.js"
import { upload } from "../middleware/multerMiddleware.js"

const router = express.Router()

router.post('/createbranch', upload.single("branchImage"), createBranch)
router.get("/get",fetchBranch)
router.get("/getallbranch",getAllBranch)
router.get("/getsinglebranch/:id",getSingle)
router.put("/updatebranch",upload.single("branchImage"),updateBranch);
router.delete("/delete/:id", deleteBranch);


export default router