/**
 * Servicio de generación de reportes en PDF
 * Utiliza PDFKit para crear documentos PDF de viajes
 */

const PDFDocument = require('pdfkit');
const viajesService = require('./viajesService');

class PDFService {
  /**
   * Generar PDF de un viaje completo
   */
  async generarPDFViaje(viajeId) {
    // Obtener datos completos del viaje
    const viaje = await viajesService.getViajeCompleto(viajeId);

    if (!viaje) {
      throw new Error('Viaje no encontrado');
    }

    // Crear documento PDF
    const doc = new PDFDocument({ margin: 50 });

    // Header
    this.generarHeader(doc);

    // Información del viaje
    this.generarInfoViaje(doc, viaje);

    // Tabla de gastos
    this.generarTablaGastos(doc, viaje.gastos);

    // Totales y saldos
    this.generarTotales(doc, viaje);

    // Footer
    this.generarFooter(doc);

    // Finalizar documento
    doc.end();

    return doc;
  }

  /**
   * Generar encabezado del PDF
   */
  generarHeader(doc) {
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('REPORTE DE VIAJE DE CARGA', { align: 'center' })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text('Sistema de Gestión de Viajes', { align: 'center' })
      .moveDown(1);

    // Línea separadora
    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .moveDown(1);
  }

  /**
   * Generar información del viaje
   */
  generarInfoViaje(doc, viaje) {
    doc.fontSize(14).font('Helvetica-Bold').text('Datos del Viaje', { underline: true });
    doc.moveDown(0.6);
    doc.fontSize(10).font('Helvetica');

    const leftX = 50;
    const rightX = 305;
    const colWidth = 230;
    let y = doc.y;

    const filas = [
      [
        { label: 'Fecha', value: this.formatearFecha(viaje.fecha_viaje) },
        { label: 'Material', value: viaje.material_transportado }
      ],
      [
        { label: 'Origen', value: viaje.origen },
        { label: 'Destino', value: viaje.destino }
      ],
      [
        { label: 'Kilos', value: `${this.formatearNumero(viaje.kilos_transportados)} kg` },
        { label: 'Placa', value: viaje.placa_vehiculo }
      ],
      [
        { label: 'Valor Flete', value: this.formatearMoneda(viaje.valor_flete) },
        { label: 'Anticipo', value: this.formatearMoneda(viaje.anticipo) }
      ]
    ];

    filas.forEach(([izquierda, derecha]) => {
      const altoIzq = this.dibujarCampoInfo(doc, izquierda.label, izquierda.value, leftX, y, colWidth);
      const altoDer = this.dibujarCampoInfo(doc, derecha.label, derecha.value, rightX, y, colWidth);
      y += Math.max(altoIzq, altoDer) + 8;
    });

    doc.y = y;

    if (viaje.observaciones) {
      doc.moveDown(0.3);
      doc.font('Helvetica-Bold').text('Observaciones:');
      doc.font('Helvetica').text(String(viaje.observaciones));
    }

    doc.moveDown(1.5);
  }

  /**
   * Dibujar un campo etiqueta/valor con alto dinámico para evitar solapes
   */
  dibujarCampoInfo(doc, label, value, x, y, width) {
    const labelWidth = 88;
    const valor = this.textoSeguro(value);

    doc.font('Helvetica-Bold').text(`${label}:`, x, y, { width: labelWidth });
    doc.font('Helvetica').text(valor, x + labelWidth, y, { width: width - labelWidth });

    const labelHeight = doc.heightOfString(`${label}:`, { width: labelWidth });
    const valueHeight = doc.heightOfString(valor, { width: width - labelWidth });
    return Math.max(labelHeight, valueHeight);
  }

  /**
   * Generar tabla de gastos
   */
  generarTablaGastos(doc, gastos) {
    doc.fontSize(14).font('Helvetica-Bold').text('Detalle de Gastos', { underline: true });
    doc.moveDown(0.5);

    if (!gastos || gastos.length === 0) {
      doc.fontSize(10).font('Helvetica-Oblique').text('No hay gastos registrados para este viaje.');
      doc.moveDown(1.5);
      return;
    }

    // Encabezados de tabla
    const tableTop = doc.y;
    const tableHeaders = [
      { text: 'Tipo de Gasto', x: 50, width: 150 },
      { text: 'Descripción', x: 210, width: 200 },
      { text: 'Valor', x: 420, width: 130, align: 'right' }
    ];

    doc.fontSize(10).font('Helvetica-Bold');
    tableHeaders.forEach(header => {
      doc.text(header.text, header.x, tableTop, { 
        width: header.width, 
        align: header.align || 'left' 
      });
    });

    // Línea debajo de encabezados
    doc
      .strokeColor('#333333')
      .lineWidth(1)
      .moveTo(50, doc.y + 5)
      .lineTo(550, doc.y + 5)
      .stroke();

    doc.moveDown(0.5);

    // Filas de gastos
    doc.font('Helvetica').fontSize(9);
    gastos.forEach((gasto, index) => {
      const rowY = doc.y;

      // Alternar color de fondo
      if (index % 2 === 0) {
        doc.fillColor('#f9f9f9')
          .rect(50, rowY - 3, 500, 20)
          .fill();
        doc.fillColor('#000000');
      }

      doc.text(gasto.tipo_gasto, 50, rowY, { width: 150 });
      doc.text(gasto.descripcion || '-', 210, rowY, { width: 200 });
      doc.text(this.formatearMoneda(gasto.valor), 420, rowY, { 
        width: 130, 
        align: 'right' 
      });

      doc.moveDown(0.8);
    });

    doc.moveDown(1);
  }

  /**
   * Generar sección de totales
   */
  generarTotales(doc, viaje) {
    const startX = 350;
    const labelWidth = 120;
    const valueWidth = 130;
    const sueldoConductor = Number.isFinite(Number(viaje.saldo_conductor))
      ? Number(viaje.saldo_conductor)
      : Number(viaje.saldo_final) || 0;
    const totalGastos = Number(viaje.total_gastos) || 0;
    const anticipo = Number(viaje.anticipo) || 0;
    const saldoFinal = Number(viaje.saldo_final) || 0;

    doc.fontSize(11).font('Helvetica-Bold');

    // Línea separadora
    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(startX, doc.y)
      .lineTo(550, doc.y)
      .stroke();

    doc.moveDown(0.5);

    // Total gastos
    let y = doc.y;
    doc.text('Total Gastos:', startX, y, { width: labelWidth });
    doc.text(this.formatearMoneda(totalGastos), startX + labelWidth, y, {
      width: valueWidth, 
      align: 'right' 
    });

    doc.moveDown(0.5);

    // Sueldo conductor
    y = doc.y;
    doc.text('Sueldo Conductor:', startX, y, { width: labelWidth });
    doc.text(this.formatearMoneda(sueldoConductor), startX + labelWidth, y, {
      width: valueWidth, 
      align: 'right' 
    });

    doc.moveDown(0.5);

    // Anticipo
    y = doc.y;
    doc.text('Anticipo:', startX, y, { width: labelWidth });
    doc.text(this.formatearMoneda(anticipo), startX + labelWidth, y, {
      width: valueWidth, 
      align: 'right' 
    });

    doc.moveDown(0.8);

    // Línea antes del saldo final
    doc
      .strokeColor('#333333')
      .lineWidth(2)
      .moveTo(startX, doc.y)
      .lineTo(550, doc.y)
      .stroke();

    doc.moveDown(0.5);

    // Saldo final
    doc.fontSize(13);
    y = doc.y;
    doc.text('Saldo Final:', startX, y, { width: labelWidth });
    
    const saldoColor = saldoFinal >= 0 ? '#008000' : '#ff0000';
    doc.fillColor(saldoColor).text(
      this.formatearMoneda(saldoFinal),
      startX + labelWidth, 
      y, 
      { width: valueWidth, align: 'right' }
    );

    doc.fillColor('#000000');
  }

  /**
   * Generar pie de página
   */
  generarFooter(doc) {
    const bottomY = 750;
    
    doc
      .fontSize(8)
      .font('Helvetica')
      .text(
        `Generado el ${this.formatearFechaHora(new Date())}`,
        50,
        bottomY,
        { align: 'center' }
      );
  }

  /**
   * Formatear fecha
   */
  formatearFecha(fecha) {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  /**
   * Formatear fecha y hora
   */
  formatearFechaHora(fecha) {
    return fecha.toLocaleString('es-CO', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formatear número
   */
  formatearNumero(numero) {
    const valor = Number(numero);
    if (!Number.isFinite(valor)) {
      return '0,00';
    }

    return valor.toLocaleString('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /**
   * Formatear moneda
   */
  formatearMoneda(valor) {
    const monto = Number(valor);
    if (!Number.isFinite(monto)) {
      return '$0';
    }

    return '$' + monto.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  /**
   * Convertir valores vacíos a texto seguro para PDF
   */
  textoSeguro(valor) {
    if (valor === undefined || valor === null || valor === '') {
      return '-';
    }
    return String(valor);
  }
}

module.exports = new PDFService();
