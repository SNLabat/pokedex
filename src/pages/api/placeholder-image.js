import { createCanvas } from 'canvas';

export default async function handler(req, res) {
  const { width = 200, height = 200, text = 'Image Placeholder' } = req.query;
  
  // Create a canvas
  const canvas = createCanvas(parseInt(width), parseInt(height));
  const ctx = canvas.getContext('2d');
  
  // Draw background
  ctx.fillStyle = '#333';
  ctx.fillRect(0, 0, width, height);
  
  // Draw text
  ctx.fillStyle = '#fff';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  
  // Set appropriate headers
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  
  // Send the response
  res.status(200).send(canvas.toBuffer());
} 