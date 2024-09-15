// Required modules
const fs = require('fs').promises;
const path = require('path');
const { minify } = require('html-minifier');
const CleanCSS = require('clean-css');
const Terser = require('terser');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

// Directories
const sourceDir = path.join(__dirname, 'source');
const distDir = path.join(__dirname, 'dist');
const baseUrl = process.env.BASE_URL || 'https://flat18.co.uk';

// Paths
const tempEntryPath = path.join(__dirname, 'source', 'js', 'temp_entry.js');
const webflowJsPath = path.join(__dirname, 'source', 'js', 'webflow.js');

// Default language for the website
const defaultLang = 'en'; // English as the default and only language

// Function to check if a directory exists
async function existsAsync(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

// Function to create the dist directory if it doesn't exist
async function createDistDirectory() {
  try {
    const exists = await existsAsync(distDir);
    if (!exists) {
      await fs.mkdir(distDir, { recursive: true });
      console.log('dist directory created successfully.');
    }
  } catch (err) {
    console.error('Error creating dist directory:', err);
    throw err;
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
  let pageTitle = filename.replace('.html', '').replace(/-/g, ' ');

  if (pageTitle.toLowerCase() === 'index') {
    pageTitle = 'Home';
  }

  if (!content.includes('<title>')) {
    const titleTag = `<title>${pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1)} | Flat18</title>\n`;
    return content.replace('</head>', `${titleTag}</head>`);
  } else {
    return content.replace(/<title>(.*?)<\/title>/, `<title>${pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1)} | Flat18</title>`);
  }
}

// Function to add canonical tag if not present
function addCanonicalTag(content, url) {
  if (!content.includes('<link rel="canonical"')) {
    const canonicalTag = `<link rel="canonical" href="${url}" />\n`;
    return content.replace('</head>', `${canonicalTag}</head>`);
  }
  return content;
}

// Function to optimise HTML content
function optimiseHtml(content) {
  return minify(content, {
    removeComments: true,
    collapseWhitespace: true,
    removeRedundantAttributes: true,
    useShortDoctype: true,
    removeEmptyAttributes: true,
    // minifyJS: true,
    // minifyCSS: true,
  });
}

// Function to replace specific <link> tags with a <script> tag
function replaceLinksWithScript(content) {
  const linkTagsRegex = /<link\s+href="css\/(normalize|webflow|flat18\.webflow)\.css"\s+rel="stylesheet"\s+type="text\/css">\s*/g;

  // Remove the specific <link> tags
  let newContent = content.replace(linkTagsRegex, '');

  // Define the <script> tag to insert
  const scriptTag = '<script src="js/bundle.js"></script>';

  // Insert the <script> tag before the closing </body> tag
  newContent = newContent.replace('</body>', `${scriptTag}\n</body>`);

  return newContent;
}

// Function to copy files from source to dist directory, minifying CSS and JS, and renaming if necessary
async function copySourceToDist(src, dest) {
  try {
    const files = await fs.readdir(src);

    for (const file of files) {
      const fullSrcPath = path.join(src, file);
      let fullDestPath = path.join(dest, file);

      const stat = await fs.stat(fullSrcPath);
      if (stat.isDirectory()) {
        // Create directory in the destination if it doesn't exist
        const exists = await existsAsync(fullDestPath);
        if (!exists) {
          await fs.mkdir(fullDestPath, { recursive: true });
        }
        // Recursively copy the directory
        await copySourceToDist(fullSrcPath, fullDestPath);
      } else {
        const ext = path.extname(fullSrcPath);

        if (ext === '.html') {
          // Read the HTML file content
          let content = await fs.readFile(fullSrcPath, 'utf-8');

          // Build canonical URL (without .html extension)
          let relativePath = path.posix.relative(distDir, fullDestPath).replace(/\\/g, '/');
          if (!relativePath.startsWith('/')) {
            relativePath = '/' + relativePath;
          }
          relativePath = relativePath.replace('.html', '');
          let canonicalUrl = `${baseUrl}${relativePath}`;

          // Add canonical and lang attributes, and ensure unique title tags
          content = addLangAttribute(content, defaultLang);
          content = addCanonicalTag(content, canonicalUrl);
          content = ensureUniqueTitle(content, file); // Ensure each page has a unique title
          content = replaceLinksWithScript(content);

          // Optimise HTML content
          try {
            const optimisedContent = optimiseHtml(content);
            if (!optimisedContent) {
              throw new Error(`HTML minification returned undefined for ${fullSrcPath}`);
            }
            // Write the optimised HTML content to the destination
            await fs.writeFile(fullDestPath, optimisedContent);
            console.log(`Copied and optimised HTML file: ${fullSrcPath} to ${fullDestPath}`);
          } catch (err) {
            console.error(`Error minifying HTML file ${fullSrcPath}:`, err);
            throw err; // Stop execution or handle the error as needed
          }
        } else if (ext === '.css') {
          // Handle CSS files with error handling (as previously updated)
        } else if (ext === '.js') {
          // Handle JS files with error handling (as previously updated)
        } else {
          // Copy other files directly
          await fs.copyFile(fullSrcPath, fullDestPath);
          console.log(`Copied file: ${fullSrcPath} to ${fullDestPath}`);
        }
      }
    }
  } catch (err) {
    console.error('Error copying files:', err);
    throw err;
  }
}

// Function to generate sitemap.xml
async function generateSitemap(directoryPath) {
  try {
    let urls = [];

    async function findHtmlFiles(dir) {
      const files = await fs.readdir(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory()) {
          await findHtmlFiles(fullPath);
        } else if (path.extname(file) === '.html') {
          // Skip .html extension in URLs for sitemap
          let relativePath = path.posix.relative(distDir, fullPath).replace(/\\/g, '/');
          if (!relativePath.startsWith('/')) {
            relativePath = '/' + relativePath;
          }
          relativePath = relativePath.replace('.html', '');
          urls.push(`${baseUrl}${relativePath}`);
        }
      }
    }

    await findHtmlFiles(directoryPath);

    let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    sitemapContent += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    for (const url of urls) {
      sitemapContent += `  <url>\n    <loc>${url}</loc>\n  </url>\n`;
    }
    sitemapContent += `</urlset>`;

    await fs.writeFile(path.join(distDir, 'sitemap.xml'), sitemapContent);
    console.log('sitemap.xml generated successfully in dist directory.');
  } catch (err) {
    console.error('Error generating sitemap:', err);
    throw err;
  }
}

// Function to generate robots.txt
async function generateRobotsTxt() {
  try {
    const robotsContent = `User-agent: *\nAllow: /\nDisallow: /*?\n\nSitemap: ${baseUrl}/sitemap.xml`;
    await fs.writeFile(path.join(distDir, 'robots.txt'), robotsContent);
    console.log('robots.txt generated successfully in dist directory.');
  } catch (err) {
    console.error('Error generating robots.txt:', err);
    throw err;
  }
}

// Function to add 301 redirects (optional)
async function createRedirects() {
  try {
    const redirects = [
      { from: '/pricing.html', to: '/pricing' },
      // Add more redirects as necessary
    ];

    let redirectRules = '';

    redirects.forEach(rule => {
      redirectRules += `Redirect 301 ${rule.from} ${rule.to}\n`;
    });

    await fs.writeFile(path.join(distDir, '_redirects'), redirectRules);
    console.log('301 redirects created successfully.');
  } catch (err) {
    console.error('Error creating redirects:', err);
    throw err;
  }
}

async function createTempEntryFile() {
  try {
    // CSS import statements
    const cssImports = `
import '../css/normalize.css';
import '../css/webflow.css';
import '../css/flat18.webflow.css';
`;

    // Read the contents of webflow.js
    const webflowJsContent = await fs.readFile(webflowJsPath, 'utf-8');

    // Combine the CSS imports and the webflow.js content
    const tempEntryContent = cssImports + '\n' + webflowJsContent;

    // Write the temporary entry file
    await fs.writeFile(tempEntryPath, tempEntryContent);
    console.log('Temporary entry file created successfully.');
  } catch (err) {
    console.error('Error creating temporary entry file:', err);
    throw err;
  }
}

async function deleteTempEntryFile() {
  try {
    await fs.unlink(tempEntryPath);
    console.log('Temporary entry file deleted successfully.');
  } catch (err) {
    console.error('Error deleting temporary entry file:', err);
    // Do not throw error here; it's cleanup
  }
}

// Function to run Webpack bundling
async function runWebpack() {
  try {
    // Create the temporary entry file
    await createTempEntryFile();

    // Update the Webpack configuration to use the temporary entry file
    webpackConfig.entry = tempEntryPath;

    // Run Webpack
    await new Promise((resolve, reject) => {
      webpack(webpackConfig, (err, stats) => {
        if (err) {
          console.error('Webpack bundling failed:', err);
          return reject(err);
        }
        const info = stats.toJson();

        if (stats.hasErrors()) {
          console.error('Webpack errors:', info.errors);
          return reject(new Error('Webpack compilation errors'));
        }

        if (stats.hasWarnings()) {
          console.warn('Webpack warnings:', info.warnings);
        }

        console.log('Webpack bundling completed successfully.');
        resolve();
      });
    });
  } catch (err) {
    throw err;
  } finally {
    // Delete the temporary entry file
    await deleteTempEntryFile();
  }
}

// Main function to perform all tasks
async function build() {
  try {
    await createDistDirectory();
    await copySourceToDist(sourceDir, distDir);
    await generateSitemap(distDir);
    await generateRobotsTxt();
    await createRedirects();
    await runWebpack();
    console.log('Build completed successfully.');
  } catch (err) {
    console.error('Build failed:', err);
  }
}

build();
