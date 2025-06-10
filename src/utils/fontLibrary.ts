// Font Library - Comprehensive collection of web fonts
// This file contains a large collection of Google Fonts and web-safe fonts for the image editor

export interface Font {
  name: string;
  cssVar: string;
  category: string;
}

// Font categories
export const FONT_CATEGORIES = [
  'Sans-serif',
  'Serif',
  'Display',
  'Script',
  'Monospace',
  'Handwriting',
  'Decorative'
];

// Core fonts (loaded via Next.js)
export const CORE_FONTS: Font[] = [
  { name: 'Inter', cssVar: 'var(--font-inter)', category: 'Sans-serif' },
  { name: 'Roboto', cssVar: 'var(--font-roboto)', category: 'Sans-serif' },
  { name: 'Open Sans', cssVar: 'var(--font-open-sans)', category: 'Sans-serif' },
  { name: 'Lato', cssVar: 'var(--font-lato)', category: 'Sans-serif' },
  { name: 'Montserrat', cssVar: 'var(--font-montserrat)', category: 'Sans-serif' },
  { name: 'Poppins', cssVar: 'var(--font-poppins)', category: 'Sans-serif' },
  { name: 'Playfair Display', cssVar: 'var(--font-playfair-display)', category: 'Serif' },
  { name: 'Merriweather', cssVar: 'var(--font-merriweather)', category: 'Serif' },
  { name: 'Oswald', cssVar: 'var(--font-oswald)', category: 'Display' },
  { name: 'Dancing Script', cssVar: 'var(--font-dancing-script)', category: 'Script' },
  { name: 'Pacifico', cssVar: 'var(--font-pacifico)', category: 'Script' },
];

// Sans-serif Google Fonts
export const SANS_SERIF_FONTS: Font[] = [
  // Popular Sans-serif Google Fonts
  { name: 'Nunito', cssVar: 'Nunito', category: 'Sans-serif' },
  { name: 'Source Sans Pro', cssVar: 'Source Sans Pro', category: 'Sans-serif' },
  { name: 'Raleway', cssVar: 'Raleway', category: 'Sans-serif' },
  { name: 'Ubuntu', cssVar: 'Ubuntu', category: 'Sans-serif' },
  { name: 'Work Sans', cssVar: 'Work Sans', category: 'Sans-serif' },
  { name: 'Barlow', cssVar: 'Barlow', category: 'Sans-serif' },
  { name: 'DM Sans', cssVar: 'DM Sans', category: 'Sans-serif' },
  { name: 'Manrope', cssVar: 'Manrope', category: 'Sans-serif' },
  { name: 'Rubik', cssVar: 'Rubik', category: 'Sans-serif' },
  { name: 'Noto Sans', cssVar: 'Noto Sans', category: 'Sans-serif' },
  { name: 'PT Sans', cssVar: 'PT Sans', category: 'Sans-serif' },
  { name: 'Oxygen', cssVar: 'Oxygen', category: 'Sans-serif' },
  { name: 'Mukti', cssVar: 'Mukti', category: 'Sans-serif' },
  { name: 'Karla', cssVar: 'Karla', category: 'Sans-serif' },
  { name: 'Hind', cssVar: 'Hind', category: 'Sans-serif' },
  { name: 'Fira Sans', cssVar: 'Fira Sans', category: 'Sans-serif' },
  { name: 'Dosis', cssVar: 'Dosis', category: 'Sans-serif' },
  { name: 'Cabin', cssVar: 'Cabin', category: 'Sans-serif' },
  { name: 'Quicksand', cssVar: 'Quicksand', category: 'Sans-serif' },
  { name: 'Muli', cssVar: 'Muli', category: 'Sans-serif' },
  { name: 'Varela Round', cssVar: 'Varela Round', category: 'Sans-serif' },
  { name: 'Titillium Web', cssVar: 'Titillium Web', category: 'Sans-serif' },
  { name: 'Exo', cssVar: 'Exo', category: 'Sans-serif' },
  { name: 'Arimo', cssVar: 'Arimo', category: 'Sans-serif' },
  { name: 'Asap', cssVar: 'Asap', category: 'Sans-serif' },
  { name: 'Catamaran', cssVar: 'Catamaran', category: 'Sans-serif' },
  { name: 'Heebo', cssVar: 'Heebo', category: 'Sans-serif' },
  { name: 'IBM Plex Sans', cssVar: 'IBM Plex Sans', category: 'Sans-serif' },
  { name: 'Libre Franklin', cssVar: 'Libre Franklin', category: 'Sans-serif' },
  // Additional Sans-serif fonts
  { name: 'Archivo', cssVar: 'Archivo', category: 'Sans-serif' },
  { name: 'Assistant', cssVar: 'Assistant', category: 'Sans-serif' },
  { name: 'Figtree', cssVar: 'Figtree', category: 'Sans-serif' },
  { name: 'Hanken Grotesk', cssVar: 'Hanken Grotesk', category: 'Sans-serif' },
  { name: 'Lexend', cssVar: 'Lexend', category: 'Sans-serif' },
  { name: 'Outfit', cssVar: 'Outfit', category: 'Sans-serif' },
  { name: 'Plus Jakarta Sans', cssVar: 'Plus Jakarta Sans', category: 'Sans-serif' },
  { name: 'Public Sans', cssVar: 'Public Sans', category: 'Sans-serif' },
  { name: 'Sora', cssVar: 'Sora', category: 'Sans-serif' },
  { name: 'Space Grotesk', cssVar: 'Space Grotesk', category: 'Sans-serif' },
];

// Serif Google Fonts
export const SERIF_FONTS: Font[] = [
  { name: 'Crimson Text', cssVar: 'Crimson Text', category: 'Serif' },
  { name: 'Lora', cssVar: 'Lora', category: 'Serif' },
  { name: 'Cormorant Garamond', cssVar: 'Cormorant Garamond', category: 'Serif' },
  { name: 'EB Garamond', cssVar: 'EB Garamond', category: 'Serif' },
  { name: 'Libre Baskerville', cssVar: 'Libre Baskerville', category: 'Serif' },
  { name: 'PT Serif', cssVar: 'PT Serif', category: 'Serif' },
  { name: 'Noto Serif', cssVar: 'Noto Serif', category: 'Serif' },
  { name: 'Source Serif Pro', cssVar: 'Source Serif Pro', category: 'Serif' },
  { name: 'Bitter', cssVar: 'Bitter', category: 'Serif' },
  { name: 'Domine', cssVar: 'Domine', category: 'Serif' },
  { name: 'Vollkorn', cssVar: 'Vollkorn', category: 'Serif' },
  { name: 'Alegreya', cssVar: 'Alegreya', category: 'Serif' },
  { name: 'Cardo', cssVar: 'Cardo', category: 'Serif' },
  { name: 'Gentium Basic', cssVar: 'Gentium Basic', category: 'Serif' },
  { name: 'Neuton', cssVar: 'Neuton', category: 'Serif' },
  { name: 'Old Standard TT', cssVar: 'Old Standard TT', category: 'Serif' },
  { name: 'Rokkitt', cssVar: 'Rokkitt', category: 'Serif' },
  { name: 'Spectral', cssVar: 'Spectral', category: 'Serif' },
  { name: 'Tinos', cssVar: 'Tinos', category: 'Serif' },
  { name: 'Zilla Slab', cssVar: 'Zilla Slab', category: 'Serif' },
  { name: 'IBM Plex Serif', cssVar: 'IBM Plex Serif', category: 'Serif' },
  { name: 'Frank Ruhl Libre', cssVar: 'Frank Ruhl Libre', category: 'Serif' },
  // Additional Serif fonts
  { name: 'Bodoni Moda', cssVar: 'Bodoni Moda', category: 'Serif' },
  { name: 'Cormorant', cssVar: 'Cormorant', category: 'Serif' },
  { name: 'DM Serif Display', cssVar: 'DM Serif Display', category: 'Serif' },
  { name: 'DM Serif Text', cssVar: 'DM Serif Text', category: 'Serif' },
  { name: 'Fraunces', cssVar: 'Fraunces', category: 'Serif' },
  { name: 'Gloock', cssVar: 'Gloock', category: 'Serif' },
  { name: 'Instrument Serif', cssVar: 'Instrument Serif', category: 'Serif' },
  { name: 'Lora', cssVar: 'Lora', category: 'Serif' },
  { name: 'Playfair', cssVar: 'Playfair', category: 'Serif' },
  { name: 'Young Serif', cssVar: 'Young Serif', category: 'Serif' },
];

// Display & Heading fonts
export const DISPLAY_FONTS: Font[] = [
  { name: 'Bebas Neue', cssVar: 'Bebas Neue', category: 'Display' },
  { name: 'Anton', cssVar: 'Anton', category: 'Display' },
  { name: 'Righteous', cssVar: 'Righteous', category: 'Display' },
  { name: 'Fredoka One', cssVar: 'Fredoka One', category: 'Display' },
  { name: 'Bangers', cssVar: 'Bangers', category: 'Display' },
  { name: 'Bungee', cssVar: 'Bungee', category: 'Display' },
  { name: 'Russo One', cssVar: 'Russo One', category: 'Display' },
  { name: 'Archivo Black', cssVar: 'Archivo Black', category: 'Display' },
  { name: 'Fjalla One', cssVar: 'Fjalla One', category: 'Display' },
  { name: 'Alfa Slab One', cssVar: 'Alfa Slab One', category: 'Display' },
  { name: 'Squada One', cssVar: 'Squada One', category: 'Display' },
  { name: 'Passion One', cssVar: 'Passion One', category: 'Display' },
  { name: 'Staatliches', cssVar: 'Staatliches', category: 'Display' },
  { name: 'Saira Condensed', cssVar: 'Saira Condensed', category: 'Display' },
  { name: 'Yanone Kaffeesatz', cssVar: 'Yanone Kaffeesatz', category: 'Display' },
  { name: 'Comfortaa', cssVar: 'Comfortaa', category: 'Display' },
  { name: 'Orbitron', cssVar: 'Orbitron', category: 'Display' },
  { name: 'Exo 2', cssVar: 'Exo 2', category: 'Display' },
  { name: 'Audiowide', cssVar: 'Audiowide', category: 'Display' },
  { name: 'Black Ops One', cssVar: 'Black Ops One', category: 'Display' },
  { name: 'Creepster', cssVar: 'Creepster', category: 'Display' },
  { name: 'Monoton', cssVar: 'Monoton', category: 'Display' },
  { name: 'Bungee Shade', cssVar: 'Bungee Shade', category: 'Display' },
  { name: 'Faster One', cssVar: 'Faster One', category: 'Display' },
  { name: 'Megrim', cssVar: 'Megrim', category: 'Display' },
  { name: 'Poiret One', cssVar: 'Poiret One', category: 'Display' },
  { name: 'Syncopate', cssVar: 'Syncopate', category: 'Display' },
  // Additional Display fonts
  { name: 'Abril Fatface', cssVar: 'Abril Fatface', category: 'Display' },
  { name: 'Besley', cssVar: 'Besley', category: 'Display' },
  { name: 'Big Shoulders Display', cssVar: 'Big Shoulders Display', category: 'Display' },
  { name: 'Chivo Mono', cssVar: 'Chivo Mono', category: 'Display' },
  { name: 'Cinzel', cssVar: 'Cinzel', category: 'Display' },
  { name: 'Codystar', cssVar: 'Codystar', category: 'Display' },
  { name: 'Graduate', cssVar: 'Graduate', category: 'Display' },
  { name: 'Londrina Outline', cssVar: 'Londrina Outline', category: 'Display' },
  { name: 'Rubik Mono One', cssVar: 'Rubik Mono One', category: 'Display' },
  { name: 'Shrikhand', cssVar: 'Shrikhand', category: 'Display' },
];

// Script & Handwriting fonts
export const SCRIPT_FONTS: Font[] = [
  { name: 'Great Vibes', cssVar: 'Great Vibes', category: 'Script' },
  { name: 'Satisfy', cssVar: 'Satisfy', category: 'Script' },
  { name: 'Kaushan Script', cssVar: 'Kaushan Script', category: 'Script' },
  { name: 'Lobster', cssVar: 'Lobster', category: 'Script' },
  { name: 'Caveat', cssVar: 'Caveat', category: 'Script' },
  { name: 'Amatic SC', cssVar: 'Amatic SC', category: 'Script' },
  { name: 'Indie Flower', cssVar: 'Indie Flower', category: 'Script' },
  { name: 'Shadows Into Light', cssVar: 'Shadows Into Light', category: 'Script' },
  { name: 'Permanent Marker', cssVar: 'Permanent Marker', category: 'Script' },
  { name: 'Courgette', cssVar: 'Courgette', category: 'Script' },
  { name: 'Handlee', cssVar: 'Handlee', category: 'Script' },
  { name: 'Kalam', cssVar: 'Kalam', category: 'Script' },
  { name: 'Patrick Hand', cssVar: 'Patrick Hand', category: 'Script' },
  { name: 'Architects Daughter', cssVar: 'Architects Daughter', category: 'Script' },
  { name: 'Cookie', cssVar: 'Cookie', category: 'Script' },
  { name: 'Allura', cssVar: 'Allura', category: 'Script' },
  { name: 'Alex Brush', cssVar: 'Alex Brush', category: 'Script' },
  { name: 'Tangerine', cssVar: 'Tangerine', category: 'Script' },
  { name: 'Pinyon Script', cssVar: 'Pinyon Script', category: 'Script' },
  { name: 'Sacramento', cssVar: 'Sacramento', category: 'Script' },
  { name: 'Yellowtail', cssVar: 'Yellowtail', category: 'Script' },
  { name: 'Parisienne', cssVar: 'Parisienne', category: 'Script' },
  { name: 'Homemade Apple', cssVar: 'Homemade Apple', category: 'Script' },
  { name: 'Reenie Beanie', cssVar: 'Reenie Beanie', category: 'Script' },
  { name: 'Gloria Hallelujah', cssVar: 'Gloria Hallelujah', category: 'Script' },
  // Additional Script fonts
  { name: 'Allison', cssVar: 'Allison', category: 'Script' },
  { name: 'Birthstone', cssVar: 'Birthstone', category: 'Script' },
  { name: 'Carattere', cssVar: 'Carattere', category: 'Script' },
  { name: 'Dancing Script', cssVar: 'Dancing Script', category: 'Script' },
  { name: 'Fasthand', cssVar: 'Fasthand', category: 'Script' },
  { name: 'Inspiration', cssVar: 'Inspiration', category: 'Script' },
  { name: 'Marck Script', cssVar: 'Marck Script', category: 'Script' },
  { name: 'Mea Culpa', cssVar: 'Mea Culpa', category: 'Script' },
  { name: 'Pacifico', cssVar: 'Pacifico', category: 'Script' },
  { name: 'Style Script', cssVar: 'Style Script', category: 'Script' },
];

// Monospace fonts
export const MONOSPACE_FONTS: Font[] = [
  { name: 'Roboto Mono', cssVar: 'Roboto Mono', category: 'Monospace' },
  { name: 'Source Code Pro', cssVar: 'Source Code Pro', category: 'Monospace' },
  { name: 'Fira Mono', cssVar: 'Fira Mono', category: 'Monospace' },
  { name: 'IBM Plex Mono', cssVar: 'IBM Plex Mono', category: 'Monospace' },
  { name: 'Space Mono', cssVar: 'Space Mono', category: 'Monospace' },
  { name: 'PT Mono', cssVar: 'PT Mono', category: 'Monospace' },
  { name: 'Ubuntu Mono', cssVar: 'Ubuntu Mono', category: 'Monospace' },
  { name: 'Courier Prime', cssVar: 'Courier Prime', category: 'Monospace' },
  { name: 'Inconsolata', cssVar: 'Inconsolata', category: 'Monospace' },
  { name: 'Anonymous Pro', cssVar: 'Anonymous Pro', category: 'Monospace' },
  { name: 'Cutive Mono', cssVar: 'Cutive Mono', category: 'Monospace' },
  { name: 'VT323', cssVar: 'VT323', category: 'Monospace' },
  { name: 'JetBrains Mono', cssVar: 'JetBrains Mono', category: 'Monospace' },
  { name: 'Courier New', cssVar: 'Courier New', category: 'Monospace' },
  { name: 'Courier', cssVar: 'Courier', category: 'Monospace' },
  { name: 'Monaco', cssVar: 'Monaco', category: 'Monospace' },
  // Additional Monospace fonts
  { name: 'Azeret Mono', cssVar: 'Azeret Mono', category: 'Monospace' },
  { name: 'Chivo Mono', cssVar: 'Chivo Mono', category: 'Monospace' },
  { name: 'DM Mono', cssVar: 'DM Mono', category: 'Monospace' },
  { name: 'Fragment Mono', cssVar: 'Fragment Mono', category: 'Monospace' },
  { name: 'Martian Mono', cssVar: 'Martian Mono', category: 'Monospace' },
  { name: 'Nanum Gothic Coding', cssVar: 'Nanum Gothic Coding', category: 'Monospace' },
  { name: 'Spline Sans Mono', cssVar: 'Spline Sans Mono', category: 'Monospace' },
  { name: 'Xanh Mono', cssVar: 'Xanh Mono', category: 'Monospace' },
];

// Decorative fonts
export const DECORATIVE_FONTS: Font[] = [
  { name: 'Bungee Inline', cssVar: 'Bungee Inline', category: 'Decorative' },
  { name: 'Fredericka the Great', cssVar: 'Fredericka the Great', category: 'Decorative' },
  { name: 'Rye', cssVar: 'Rye', category: 'Decorative' },
  { name: 'Henny Penny', cssVar: 'Henny Penny', category: 'Decorative' },
  { name: 'Lobster Two', cssVar: 'Lobster Two', category: 'Decorative' },
  { name: 'Special Elite', cssVar: 'Special Elite', category: 'Decorative' },
  { name: 'Kranky', cssVar: 'Kranky', category: 'Decorative' },
  { name: 'Fontdiner Swanky', cssVar: 'Fontdiner Swanky', category: 'Decorative' },
  { name: 'Ribeye Marrow', cssVar: 'Ribeye Marrow', category: 'Decorative' },
  { name: 'Ewert', cssVar: 'Ewert', category: 'Decorative' },
  { name: 'Butcherman', cssVar: 'Butcherman', category: 'Decorative' },
  { name: 'Eater', cssVar: 'Eater', category: 'Decorative' },
  { name: 'Nosifer', cssVar: 'Nosifer', category: 'Decorative' },
  { name: 'Rubik Beastly', cssVar: 'Rubik Beastly', category: 'Decorative' },
  { name: 'Rubik Wet Paint', cssVar: 'Rubik Wet Paint', category: 'Decorative' },
  { name: 'Sedgwick Ave Display', cssVar: 'Sedgwick Ave Display', category: 'Decorative' },
];

// Combine all fonts into one master list
export const ALL_FONTS: Font[] = [
  ...CORE_FONTS,
  ...SANS_SERIF_FONTS,
  ...SERIF_FONTS,
  ...DISPLAY_FONTS,
  ...SCRIPT_FONTS,
  ...MONOSPACE_FONTS,
  ...DECORATIVE_FONTS
];

// Function to get fonts by category
export function getFontsByCategory(category: string): Font[] {
  return ALL_FONTS.filter(font => font.category === category);
}

// Function to get a font by name
export function getFontByName(name: string): Font | undefined {
  return ALL_FONTS.find(font => font.name === name);
}

// Function to preload popular fonts
export async function preloadPopularFonts(): Promise<void> {
  // List of popular fonts to preload for better user experience
  const popularFonts = [
    'Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Poppins',
    'Playfair Display', 'Lora', 'Oswald', 'Dancing Script',
    'Bebas Neue', 'Caveat', 'Pacifico'
  ];
  
  // Create link elements for each font
  popularFonts.forEach(fontName => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;700&display=swap`;
    document.head.appendChild(link);
  });
}
