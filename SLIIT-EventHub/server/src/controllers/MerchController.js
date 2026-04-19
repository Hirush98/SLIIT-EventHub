const Merch = require("../models/MerchModel");
const getAllMerch = async (req, res,next) => {
    let merch;
    try {
        merch = await Merch.find();
    } catch (err) {        console.log(err);
    }   //not found
 if (!merch) {        
        return res.status(404).json({ message: "No merch found" });
    }    return res.status(200).json({ merch });
};


//data insert
const addMerch = async (req, res, next) => {
    const { name, description, price, stock, category } = req.body || {};
    const image = req.file ? `/uploads/${req.file.filename}` : "";

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
            message: "Request body is required. Send JSON or form data with the merch fields.",
        });
    }

    let merch;
    try {
        merch = new Merch({ name, description, price, stock, category, image });
        await merch.save();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable To Add Your Merch" });
    }

    if (!merch) {
        return res.status(500).json({ message: "Unable To Add Your Merch" });
    }
    return res.status(201).json({ merch });
};

//get by id
const getById = async (req, res, next) => {
    const id = req.params.id;
    let merch;
    try {
        merch = await Merch.findById(id);
    } catch (err) {
        console.log(err);
    }
    if (!merch) {
        return res.status(404).json({ message: "No merch found" });
    }
    return res.status(200).json({ merch });
};

//update data
const updateMerch = async (req, res, next) => {
    const id = req.params.id;
    const { name, description, price, stock, category } = req.body;
    const updateData = {
        name,
        description,
        price,
        stock,
        category,
    };

    if (req.file) {
        updateData.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
        updateData.image = req.body.image;
    }

    let merch;
    try {
        merch = await Merch.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
    } catch (err) {
        console.log(err);
    }  
    if (!merch) {
        return res.status(404).json({ message: "Unable To Update Your Merch" });
    }
    return res.status(200).json({ merch });
};

//delete data
const deleteMerch = async (req, res, next) => {
    const id = req.params.id;
    let merch;
    try {
        merch = await Merch.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable To Delete Your Merch" });
    }
    if (!merch) {
        return res.status(404).json({ message: "Unable To Delete Your Merch" });
    }
    return res.status(200).json({ message: "Merch Successfully Deleted" });
};  

 

  


exports.getAllMerch = getAllMerch;
exports.addMerch = addMerch;
exports.getById = getById;
exports.updateMerch = updateMerch;
exports.deleteMerch = deleteMerch;
