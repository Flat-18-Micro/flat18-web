const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier');
const { minify: terserMinify } = require('terser');
const CleanCSS = require('clean-css');
const { PurgeCSS } = require('purgecss');

// Directories
const sourceDir = path.join(__dirname, 'source');
const distDir = path.join(__dirname, 'dist');
const baseUrl = process.env.BASE_URL || 'https://flat18.co.uk';

// Default language for the website
const defaultLang = 'en';  // English as the default and only language

// Function to create the dist directory if it doesn't exist
function createDistDirectory() {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
    console.log('dist directory created successfully.');
  }
}

// Function to add lang attribute if not present
function addLangAttribute(content, lang) {
  if (!content.includes(' lang=')) {
    return content.replace('<html', `<html lang="${lang}"`);
  }
  return content;
}

// Function to ensure unique title tags for each page
function ensureUniqueTitle(content, filename) {
  const pageTitle = filename.replace('.html', '').replace(/-/g, ' ');  // Simple title based on filename

  if (!content.includes('<title>')) {
    const titleTag = `<title>${pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1)} | Flat18</title>\n`;
    return content.replace('</head>', `${titleTag}</head>`);
  } else {
    return content.replace(/<title>(.*?)<\/title>/, `<title>${pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1)} | Flat18</title>`);
  }
}

// Function to add canonical tag if not present
function addCanonicalTag(content, url) {
  // Ensure the canonical URL doesn't have trailing slashes or include unnecessary subpaths
  const canonicalUrl = new URL(url, baseUrl).href.replace(/\/$/, '');  // Remove trailing slashes
  if (!content.includes('<link rel="canonical"')) {
    const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />\n`;
    return content.replace('</head>', `${canonicalTag}</head>`);
  }
  return content;
}

// Function to add hreflang tags for multi-language support
function addHreflangTags(content, url) {
  const hreflangTags = `
    <link rel="alternate" href="${url}" hreflang="en" />
    <link rel="alternate" href="${url}" hreflang="x-default" />
  `;

  if (!content.includes('hreflang="')) {
    return content.replace('</head>', `${hreflangTags}\n</head>`);
  }
  return content;
}

// Function to add alt attribute to <img> tags if not present
function addAltAttribute(content) {
  // Regular expression to find <img> tags without alt attributes
  const imgTagWithoutAlt = /<img\s+((?!alt=)[^>]+)>/g;

  // Replace <img> tags without alt attributes
  content = content.replace(imgTagWithoutAlt, (match) => {
    // Try to infer alt text from the image filename if possible
    const srcMatch = match.match(/src="([^"]+)"/);
    let altText = 'Image';
    
    if (srcMatch && srcMatch[1]) {
      const imageFileName = path.basename(srcMatch[1], path.extname(srcMatch[1]));
      altText = imageFileName.replace(/-/g, ' ').replace(/_/g, ' '); // Use the file name as alt text, formatted nicely
    }

    return match.replace('>', ` alt="${altText}">`);
  });

  return content;
}

// Function to defer script loading by adding defer attribute
function optimizeScriptTags(content) {
  return content.replace(/<script(?!.*\bdefer\b)(?!.*\basync\b)(.*?)>/g, '<script$1 defer>');
}

// Function to extract inline scripts and replace them with external files
function extractInlineScripts(content, fileName) {
  const inlineScriptPattern = /<script>([\s\S]*?)<\/script>/g;
  let match;
  let counter = 0;

  while ((match = inlineScriptPattern.exec(content)) !== null) {
    counter++;
    const scriptContent = match[1];
    const scriptFileName = `${fileName.replace('.html', '')}-inline-${counter}.js`;

    fs.writeFileSync(path.join(distDir, scriptFileName), scriptContent);
    const scriptTag = `<script src="${scriptFileName}" defer></script>`;
    content = content.replace(match[0], scriptTag);
  }

  return content;
}

// Function to replace specific JS files with bundle.js
function replaceScriptTag(content) {
  // Replace webflow.js with bundle.js
  return content.replace(/<script src="js\/webflow\.js"[^>]*><\/script>/g, '<script src="js/bundle.js" defer></script>');
}

// Function to replace multiple CSS <link> tags with a single <link> to bundle.css
function replaceCSSLinks(content) {
  // Regex to match all <link> tags that load CSS files from the 'css/' folder, accounting for continuous tags
  const cssLinkPattern = /<link href="css\/[a-zA-Z0-9.-]+\.css" rel="stylesheet" type="text\/css">/g;

  // Replace matched <link> tags with a single link to bundle.css
  return content.replace(cssLinkPattern, '').replace('</head>', '<link href="css/bundle.css" rel="stylesheet" type="text/css"></head>');
}

// Function to replace remote jQuery with local jQuery
function replaceJQuery(content) {
  // Regex to match remote jQuery scripts with varying URLs and query parameters
  const jQueryPattern = /<script src="https:\/\/[a-zA-Z0-9.-]+\/js\/jquery-\d+\.\d+\.\d+\.min\.[a-zA-Z0-9]+\.js\?site=[a-zA-Z0-9]+"[^>]*><\/script>/g;

  // Replace the remote jQuery script with the local version served from the filesystem
  return content.replace(jQueryPattern, '<script src="static/js/jquery-3.6.0.slim.min.js" defer></script>');
}

// Function to minify and concatenate CSS files
async function minifyAndConcatenateCSS(files, outputPath) {
  let concatenatedCSS = '';

  for (const file of files) {
    if (fs.existsSync(file)) {
      const cssContent = await fs.promises.readFile(file, 'utf-8');
      concatenatedCSS += cssContent;
    } else {
      console.warn(`File not found: ${file}`);
    }
  }

  const output = new CleanCSS({}).minify(concatenatedCSS);
  await fs.promises.writeFile(outputPath, output.styles);
  console.log(`Minified and concatenated CSS to ${outputPath}`);
}

// Function to remove unused CSS using PurgeCSS
async function purgeUnusedCSS(cssFilePath, htmlFiles) {
  const purgeCSSResults = await new PurgeCSS().purge({
    content: htmlFiles,
    css: [cssFilePath],
  });

  const purgedCSS = purgeCSSResults[0].css;
  await fs.promises.writeFile(cssFilePath, purgedCSS);
  console.log(`Removed unused CSS from ${cssFilePath}`);
}

// Function to lazy-load images by adding loading="lazy" to <img> tags
function lazyLoadImages(content) {
  return content.replace(/<img /g, '<img loading="lazy" ');
}

// Function to optimize font loading with font-display: swap
function optimizeFonts(content) {
  return content.replace(
    /@font-face\s*{[^}]*}/g,
    match => match.replace('font-display', 'font-display: swap')
  );
}

// Function to generate and inline critical CSS (dynamically import `critical`)
async function inlineCriticalCSS(htmlFilePath, outputHtmlPath) {
  const critical = await import('critical');  // Dynamically load `critical`
  await critical.generate({
    base: 'dist/',  // Base directory
    src: htmlFilePath,  // Input HTML file
    target: {
      html: outputHtmlPath,  // Output HTML file with inlined CSS
    },
    inline: true,  // Inline critical CSS
    css: ['dist/css/bundle.css'],  // Path to your CSS bundle
  });
  console.log(`Inlined critical CSS for ${htmlFilePath}`);
}

// Function to load non-critical CSS asynchronously using media="print"
function loadNonCriticalCSSAsync(content) {
  return content.replace(/<link rel="stylesheet" href="(.*?)\.css">/g, '<link rel="stylesheet" href="$1.css" media="print" onload="this.media=\'all\'">');
}

// Function to minify and concatenate JavaScript files (skip if file not found)
async function minifyAndConcatenateJS(files, outputPath) {
  let concatenatedJS = '';

  for (const file of files) {
    if (fs.existsSync(file)) {
      const jsContent = await fs.promises.readFile(file, 'utf-8');
      concatenatedJS += jsContent;
    } else {
      console.warn(`File not found: ${file}`);
    }
  }

  if (concatenatedJS) {
    const minifiedResult = await terserMinify(concatenatedJS);
    await fs.promises.writeFile(outputPath, minifiedResult.code);
    console.log(`Minified and concatenated JS to ${outputPath}`);
  } else {
    console.log('No JS files to minify and concatenate.');
  }
}

// Function to optimise HTML content
function optimiseHtml(content) {
  return minify(content, {
    removeComments: true,
    collapseWhitespace: true,
    removeRedundantAttributes: true,
    useShortDoctype: true,
    removeEmptyAttributes: true,
    minifyJS: true,
    minifyCSS: true,
  });
}

// Function to find all HTML files in the dist directory
function getAllHtmlFiles(dir) {
  let htmlFiles = [];
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      htmlFiles = htmlFiles.concat(getAllHtmlFiles(fullPath));
    } else if (path.extname(file) === '.html') {
      htmlFiles.push(fullPath);
    }
  });
  return htmlFiles;
}

// Function to copy files from source to dist directory, renaming if necessary
async function copySourceToDist(src, dest) {
  const files = await fs.promises.readdir(src);

  for (const file of files) {
    const fullSrcPath = path.join(src, file);
    const fullDestPath = path.join(dest, file);
    const stat = await fs.promises.stat(fullSrcPath);

    if (stat.isDirectory()) {
      if (!fs.existsSync(fullDestPath)) {
        await fs.promises.mkdir(fullDestPath);
      }
      await copySourceToDist(fullSrcPath, fullDestPath);
    } else {
      if (path.extname(fullSrcPath) !== '.html') {
        await fs.promises.copyFile(fullSrcPath, fullDestPath);
      } else {
        let content = await fs.promises.readFile(fullSrcPath, 'utf-8');

        // Replace multiple CSS links with a single link to bundle.css
        content = replaceCSSLinks(content);

        // Build canonical URL (without .html extension)
        let canonicalUrl = fullDestPath.replace(distDir, '').replace('.html', '');
        canonicalUrl = `${baseUrl}${canonicalUrl}`;

        // Add canonical, lang attributes, and ensure unique title tags
        content = addLangAttribute(content, defaultLang);
        content = addHreflangTags(content, canonicalUrl);  // Add hreflang tags here
        content = addAltAttribute(content);  // Add alt attributes if missing
        content = addCanonicalTag(content, canonicalUrl);
        // content = ensureUniqueTitle(content, file);
        content = optimizeScriptTags(content);  // Defer script loading
        content = extractInlineScripts(content, file);  // Extract inline scripts
        content = replaceScriptTag(content);  // Replace specific script with bundle.js
        content = replaceJQuery(content);  // Replace remote jQuery with local jQuery
        content = loadNonCriticalCSSAsync(content);  // Load non-critical CSS asynchronously

        // Lazy load images
        content = lazyLoadImages(content);

        // Optimize fonts for font-display: swap
        content = optimizeFonts(content);

        // Minify HTML
        content = optimiseHtml(content);

        await fs.promises.writeFile(fullDestPath, content);
        console.log(`Copied and optimised HTML file: ${fullSrcPath} to ${fullDestPath}`);
      }
    }
  }
}

// Function to generate sitemap.xml
function generateSitemap(directoryPath) {
  let urls = [];

  function findHtmlFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        findHtmlFiles(fullPath);
      } else if (path.extname(file) === '.html') {
        let relativePath = path.relative(directoryPath, fullPath).replace('.html', '');
        urls.push(`${baseUrl}/${relativePath.replace(/\\/g, '/')}`);
      }
    });
  }

  findHtmlFiles(directoryPath);

  let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  urls.forEach(url => {
    sitemapContent += `  <url>\n    <loc>${url}</loc>\n  </url>\n`;
  });
  sitemapContent += `</urlset>`;

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapContent);
  console.log('sitemap.xml generated successfully in dist directory.');
}

// Function to generate robots.txt
function generateRobotsTxt() {
  const robotsContent = `User-agent: *\nAllow: /\nDisallow: /*?\n\nSitemap: ${baseUrl}/sitemap.xml`;
  fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsContent);
  console.log('robots.txt generated successfully in dist directory.');
}

// Main function to perform all tasks
async function build() {
  try {
    createDistDirectory();
    
    // Copy source to dist with HTML processing and optimizations
    await copySourceToDist(sourceDir, distDir);

    // CSS Optimization
    await minifyAndConcatenateCSS(
      [
        path.join(sourceDir, 'css/normalize.css'),
        path.join(sourceDir, 'css/webflow.css'),
        path.join(sourceDir, 'css/flat18.webflow.css')
      ],
      path.join(distDir, 'css/bundle.css')
    );

    // Inline critical CSS for above-the-fold content
    await inlineCriticalCSS(path.join(distDir, 'index.html'), path.join(distDir, 'index.html'));

    // Remove unused CSS based on all HTML files in dist directory
    await purgeUnusedCSS(path.join(distDir, 'css/bundle.css'), getAllHtmlFiles(distDir));

    // JS Optimization
    await minifyAndConcatenateJS(
      [path.join(sourceDir, 'js/webflow.js')],
      path.join(distDir, 'js/bundle.js')
    );

    // Generate Sitemap and Robots.txt
    generateSitemap(distDir);
    generateRobotsTxt();

    console.log('Build completed successfully.');
  } catch (err) {
    console.error('Build failed:', err);
  }
}

build();