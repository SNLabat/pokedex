export default function handler(req, res) {
  // Generate an SVG image as a placeholder
  const { width = 200, height = 200, text = 'Image Placeholder' } = req.query;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#333" />
      <text x="50%" y="50%" font-family="Arial" font-size="20" fill="white" 
            text-anchor="middle" dominant-baseline="middle">
        ${text}
      </text>
    </svg>
  `;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.status(200).send(svg);
} 