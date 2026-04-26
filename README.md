# CheckQR - QR Code Generator

Generate QR codes for URLs, credentials, text, vCard, WiFi, and email.

## Features

- **Multiple Types**: URL, Text, vCard, WiFi, Email, Credential
- **Size Options**: Customizable QR size (50-500px)
- **History**: Saves generated QR codes
- **Batch Mode**: Generate multiple QRs at once
- **Download**: Save as PNG

## Usage

1. Open `index.html` in browser
2. Select QR type
3. Enter data
4. Click Generate
5. Download or copy

## Types

- **URL**: Any web link
- **Text**: Plain text message
- **vCard**: Contact info
- **WiFi**: Network credentials
- **Email**: Mailto link
- **Credential**: Embedded verification

## API

```javascript
// Generate QR (returns canvas dataURL)
generateQRCode(text, size);

// Download
downloadQR(); // Downloads PNG

// Batch
batchGenerate(); // Multiple at once
```

## Browser Support

Works in all modern browsers with Canvas API.

## License

MIT