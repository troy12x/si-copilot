# Font Installation Guide

## Installing Quincy Font

The SI Copilot application uses the Quincy font for its hero section. To properly display this font, you'll need to obtain and install it. Here are the steps:

### Option 1: Purchase Quincy Font

Quincy is a premium font that can be purchased from:
- [Monotype](https://www.monotype.com/)
- [MyFonts](https://www.myfonts.com/)

After purchasing, you'll receive font files that should be placed in the `/public/fonts/` directory:
- `Quincy.woff2`
- `Quincy.woff`
- `Quincy-Bold.woff2`
- `Quincy-Bold.woff`

### Option 2: Use a Font Service

Alternatively, you can use a font service like Adobe Fonts or Google Fonts:

1. If using Adobe Fonts, add the font to your project and update the `globals.css` file with the provided CSS.

2. If using a different font service, update the `@font-face` declarations in `globals.css` with the appropriate URLs.

### Option 3: Use a Similar Alternative Font

If you cannot obtain Quincy, you can use a similar serif font:

1. Update the `tailwind.config.js` file to use your alternative font:
```js
fontFamily: {
  'quincy': ['YourAlternativeFont', 'Georgia', 'serif'],
},
```

2. Remove or update the `@font-face` declarations in `globals.css`.

## Verifying Font Installation

After installing the font, restart your development server and verify that the font is displaying correctly in the hero section.
