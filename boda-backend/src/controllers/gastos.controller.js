const Gasto = require('../models/Gasto');
const mongoose = require('mongoose');

exports.getGastos = async (req, res) => {
  try {
    // Filtros simplificados sin eventoId
    const { categoria, estadoPago, proveedor, desde, hasta } = req.query;
    
    const filtros = {};

    if (categoria) filtros.categoria = categoria;
    if (estadoPago) filtros.estadoPago = estadoPago;
    if (proveedor) filtros['proveedor.nombre'] = new RegExp(proveedor, 'i');
    
    // Filtro por rango de fechas
    if (desde || hasta) {
      filtros.fecha = {};
      if (desde) filtros.fecha.$gte = new Date(desde);
      if (hasta) filtros.fecha.$lte = new Date(hasta);
    }

    const gastos = await Gasto.find(filtros)
      .sort({ fecha: -1, createdAt: -1 });

    res.status(200).json(gastos);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener gastos',
      error: error.message 
    });
  }
};

exports.createGasto = async (req, res) => {
  try {
    // Validación específica para banquete
    if (req.body.categoria === 'banquete' && req.body.monto > 10000) {
      req.body.estadoPago = 'pendiente';
    }

    const nuevoGasto = new Gasto({
      ...req.body
    });

    await nuevoGasto.save();
    
    res.status(201).json({
      ...nuevoGasto._doc,
      alerta: req.body.monto > 5000 ? 'Este gasto excede el promedio para su categoría' : null
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al registrar gasto',
      error: error.message,
      detalles: error.errors 
    });
  }
};

exports.updateGasto = async (req, res) => {
  try {
    // Validación simplificada sin verificación de evento
    const gastoExistente = await Gasto.findById(req.params.id);

    if (!gastoExistente) {
      return res.status(404).json({ message: 'Gasto no encontrado' });
    }

    // Lógica para actualización de pagos
    if (req.body.montoPagado !== undefined) {
      if (req.body.montoPagado > gastoExistente.monto) {
        return res.status(400).json({ message: 'El monto pagado no puede exceder el gasto total' });
      }
      
      req.body.estadoPago = 
        req.body.montoPagado === gastoExistente.monto ? 'pagado' :
        req.body.montoPagado > 0 ? 'parcial' : 'pendiente';
    }

    const gastoActualizado = await Gasto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      ...gastoActualizado._doc,
      mensaje: 'Gasto actualizado. ' + 
        (gastoActualizado.estadoPago === 'pagado' ? 'Pago completado ✓' : '')
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al actualizar gasto',
      error: error.message 
    });
  }
};

exports.deleteGasto = async (req, res) => {
  try {
    const gasto = await Gasto.findByIdAndDelete(req.params.id);

    if (!gasto) {
      return res.status(404).json({ message: 'Gasto no encontrado' });
    }

    res.status(200).json({ 
      message: 'Gasto eliminado correctamente',
      categoriaEliminada: gasto.categoria,
      montoLiberado: gasto.monto - gasto.montoPagado
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al eliminar gasto',
      error: error.message 
    });
  }
};

// Controladores adicionales modificados
exports.getResumenGastos = async (req, res) => {
  try {
    const resumen = await Gasto.aggregate([
      {
        $group: {
          _id: '$categoria',
          total: { $sum: '$monto' },
          pagado: { $sum: '$montoPagado' },
          pendiente: { $sum: { $subtract: ['$monto', '$montoPagado'] } },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.status(200).json(resumen);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener resumen de gastos',
      error: error.message 
    });
  }
};

exports.getProximosPagos = async (req, res) => {
  try {
    const proximosPagos = await Gasto.find({
      estadoPago: { $ne: 'pagado' },
      fecha: { 
        $gte: new Date(), 
        $lte: new Date(Date.now() + 30*24*60*60*1000) // Próximos 30 días
      }
    }).sort({ fecha: 1 });

    res.status(200).json(proximosPagos);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener próximos pagos',
      error: error.message 
    });
  }
};