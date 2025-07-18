// /api/pdf.js
import chromium from 'chrome-aws-lambda';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const {
    nombreCliente = '', correo = '', direccion = '', telefono = '',
    tipoEquipo = '', comuna = '', marca = '',
    detalleTrabajo = '', resumenGastos = '',
    abono = '', saldo = '', total = '',
    marcarVisita = '', marcarAcepta = '',
    numeroFactura = '', dia = '', mes = '', anio = ''
  } = req.query;

  try {
    const templatePath = path.join(process.cwd(), 'api', 'template.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    const replacements = {
      nombreCliente, correo, direccion, telefono,
      tipoEquipo, comuna, marca,
      detalleTrabajo, resumenGastos,
      abono, saldo, total,
      marcarVisita, marcarAcepta,
      numeroFactura, dia, mes, anio
    };

    for (const [key, value] of Object.entries(replacements)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=factura.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error al generar el PDF:', error);
    res.status(500).send('Error al generar el PDF');
  }
}
