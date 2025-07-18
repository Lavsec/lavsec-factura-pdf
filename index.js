const express = require('express');
const fs = require('fs');
const path = require('path');
const chromium = require('chrome-aws-lambda');

const app = express();

app.get('/api/pdf', async (req, res) => {
  try {
    const templatePath = path.join(__dirname, 'plantilla.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    // Reemplazo de variables
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

    // Generar el PDF usando chrome-aws-lambda
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

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=factura.pdf',
    });

    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error al generar el PDF:', error);
    res.status(500).send('Error al generar el PDF');
  }
});

module.exports = app;
