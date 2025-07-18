import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const {
    nombre,
    direccion,
    comuna,
    telefono,
    correo,
    equipo,
    marca,
    tipo,
    descripcion,
    fecha,
    abono,
    saldo,
    total,
    acepta,
    rut,
    rutcliente,
    tecnico,
  } = req.query;

  const templatePath = path.join(process.cwd(), 'plantilla.html');
  let html = fs.readFileSync(templatePath, 'utf8');

  html = html.replace('{{nombre}}', nombre || '');
  html = html.replace('{{direccion}}', direccion || '');
  html = html.replace('{{comuna}}', comuna || '');
  html = html.replace('{{telefono}}', telefono || '');
  html = html.replace('{{correo}}', correo || '');
  html = html.replace('{{equipo}}', equipo || '');
  html = html.replace('{{marca}}', marca || '');
  html = html.replace('{{tipo}}', tipo || '');
  html = html.replace('{{descripcion}}', descripcion || '');
  html = html.replace('{{fecha}}', fecha || '');
  html = html.replace('{{abono}}', abono || '');
  html = html.replace('{{saldo}}', saldo || '');
  html = html.replace('{{total}}', total || '');
  html = html.replace('{{acepta}}', acepta || '');
  html = html.replace('{{rut}}', rut || '');
  html = html.replace('{{rutcliente}}', rutcliente || '');
  html = html.replace('{{tecnico}}', tecnico || '');

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=factura.pdf');
  res.send(pdfBuffer);
}
