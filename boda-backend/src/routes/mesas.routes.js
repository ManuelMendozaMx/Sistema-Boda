const express = require("express");
const router = express.Router();
const Layout = require("../models/Layout");

router.post("/", async (req, res) => {
  try {
    const nuevoLayout = new Layout({
      espacios: req.body.espacios
    });
    await nuevoLayout.save();
    res.json({ success: true, layoutId: nuevoLayout._id });
  } catch (err) {
    res.status(500).json({ error: "Error al guardar layout", details: err });
  }
});

router.get("/", async (req, res) => {
  try {
    const layouts = await Layout.find().sort({ creadoEn: -1 }).limit(1);
    res.json(layouts[0] || { espacios: [] });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener layout", details: err });
  }
});

module.exports = router;
