const express = require('express');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  try {
    // Cargar plantilla HTML
    const templatePath = path.join(__dirname, 'plantilla.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    // Reemplazar variables del HTML con datos desde query string
    html = html.replace('{{nombre}}', req.query.nombre || '');
    html = html.replace('{{direccion}}', req.query.direccion || '');
    html = html.replace('{{comuna}}', req.query.comuna || '');
    html = html.replace('{{telefono}}', req.query.telefono || '');
    html = html.replace('{{marca}}', req.query.marca || '');
    html = html.replace('{{tipo}}', req.query.tipo || '');
    html = html.replace('{{descripcion}}', req.query.descripcion || '');
    html = html.replace('{{fecha}}', req.query.fecha || '');
    html = html.replace('{{presupuesto}}', req.query.presupuesto || '');
    html = html.replace('{{abono}}', req.query.abono || '');
    html = html.replace('{{saldo}}', req.query.saldo || '');
    html = html.replace('{{numero}}', req.query.numero || '');
    html = html.replace('{{visita}}', req.query.visita === 'true' ? 'X' : '');
    html = html.replace('{{acepta}}', req.query.acepta === 'true' ? 'X' : '');

    // Generar PDF con Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    // Devolver el PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=factura.pdf',
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).send('Error al generar PDF');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
