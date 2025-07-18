// /api/pdf.js (dentro de carpeta /api si estás en Vercel)
import chromium from 'chrome-aws-lambda';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const {
    nombre = '', direccion = '', comuna = '', telefono = '', correo = '',
    equipo = '', marca = '', tipo = '', descripcion = '', fecha = '',
    abono = '', saldo = '', total = '', acepta = '', rut = '', rutcliente = '', tecnico = ''
  } = req.query;

  try {
    const templatePath = path.join(process.cwd(), 'plantilla.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    const replacements = {
      nombre, direccion, comuna, telefono, correo, equipo,
      marca, tipo, descripcion, fecha, abono, saldo, total,
      acepta, rut, rutcliente, tecnico
    };

    for (const [key, value] of Object.entries(replacements)) {
      html = html.replace(`{{${key}}}`, value);
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
