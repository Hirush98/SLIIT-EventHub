const express = require("express");
const router = express.Router();
const MerchController = require("../controllers/MerchController");
const upload = require("../middleware/upload");


//get all data
router.get("/", MerchController.getAllMerch);

//add data
router.post("/", upload.single("image"), MerchController.addMerch);

//get by id
router.get("/:id", MerchController.getById);

//update data
router.put("/:id", upload.single("image"), MerchController.updateMerch);

//delete data   
router.delete("/:id", MerchController.deleteMerch);  




//export router
module.exports = router;

