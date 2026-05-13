/**
 * Controlador de PDF
 * Manejo de generación de reportes en PDF
 */

const pdfService = require('../services/pdfService');

class PDFController {
  /**
   * GET /api/viajes/:id/pdf
   * Generar y descargar PDF de un viaje
   */
  async generarPDFViaje(req, res, next) {
    try {
      const { id } = req.params;

      // Generar PDF
      const pdfDoc = await pdfService.generarPDFViaje(id);

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=viaje_${id}.pdf`);

      // Enviar PDF como stream
      pdfDoc.pipe(res);

    } catch (error) {
      if (error.message === 'Viaje no encontrado') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }
}

module.exports = new PDFController();
