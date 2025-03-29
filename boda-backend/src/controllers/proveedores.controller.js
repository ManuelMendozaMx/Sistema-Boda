const Proveedor = require('../models/Proveedor');

exports.getProveedores = async (req, res) => {
  try {
    const proveedores = await Proveedor.find();
    res.status(200).json(proveedores);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener proveedores', error });
  }
};

exports.createProveedor = async (req, res) => {
  try {
    const nuevoProveedor = new Proveedor(req.body);
    await nuevoProveedor.save();
    res.status(201).json(nuevoProveedor);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear proveedor', error });
  }
};

exports.updateProveedor = async (req, res) => {
  try {
    const proveedorActualizado = await Proveedor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(proveedorActualizado);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar proveedor', error });
  }
};

exports.deleteProveedor = async (req, res) => {
  try {
    await Proveedor.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Proveedor eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar proveedor', error });
  }
};
