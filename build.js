const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier');
const sharp = require('sharp');
const { execSync } = require('child_process');
const postcss = require('postcss');
const purgecss = require('@fullhuman/postcss-purgecss');
const cssnano = require('cssnano');

// Directories
const sourceDir = path.join(__dirname, 'source');
const distDir = path.join(__dirname, 'dist');
const baseUrl = process.env.BASE_URL || 'https://flat18.co.uk';

// Default language for the website
const defaultLang = 'en';  // English as the default and only language

// Function to create the dist directory if it doesn't exist
function createDistDirectory() {
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
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
    if (!content.includes('<link rel="canonical"')) {
        const canonicalTag = `<link rel="canonical" href="${url}" />\n`;
        return content.replace('</head>', `${canonicalTag}</head>`);
    }
    return content;
}

// Function to optimize HTML content
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

// Function to optimize CSS
function optimizeCSS() {
    const cssPath = path.join(sourceDir, 'css', 'styles.css');
    const distCssPath = path.join(distDir, 'css', 'styles.min.css');

    if (!fs.existsSync(cssPath)) {
        console.warn('CSS file not found:', cssPath);
        return;
    }

    const css = fs.readFileSync(cssPath, 'utf-8');

    postcss([
        purgecss({
            content: [`${distDir}/**/*.html`],
            defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
        }),
        cssnano(),
    ])
        .process(css, { from: undefined })
        .then(result => {
            fs.writeFileSync(distCssPath, result.css);
            console.log('CSS optimized successfully.');
        })
        .catch(err => {
            console.error('CSS optimization failed:', err);
        });
}

// Function to optimize images
function optimizeImages(srcDir, destDir) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

    const files = fs.readdirSync(srcDir);

    files.forEach(file => {
        const fullSrcPath = path.join(srcDir, file);
        const fullDestPath = path.join(destDir, file);
        const ext = path.extname(file).toLowerCase();

        if (fs.statSync(fullSrcPath).isDirectory()) {
            if (!fs.existsSync(fullDestPath)) {
                fs.mkdirSync(fullDestPath, { recursive: true });
            }
            optimizeImages(fullSrcPath, fullDestPath);
        } else if (imageExtensions.includes(ext)) {
            sharp(fullSrcPath)
                .toFormat('webp', { quality: 80 })
                .toFile(fullDestPath.replace(ext, '.webp'))
                .then(() => {
                    console.log(`Optimized image: ${file} to ${fullDestPath.replace(ext, '.webp')}`);
                })
                .catch(err => {
                    console.error(`Image optimization failed for ${file}:`, err);
                });
        } else {
            fs.copyFileSync(fullSrcPath, fullDestPath);
            console.log(`Copied file: ${fullSrcPath} to ${fullDestPath}`);
        }
    });
}

// Function to copy files from source to dist directory, renaming if necessary
function copySourceToDist(src, dest) {
    const files = fs.readdirSync(src);

    files.forEach(file => {
        let fullSrcPath = path.join(src, file);
        let fullDestPath = path.join(dest, file);

        // Check if the file name contains "webflow"
        if (file.includes('webflow')) {
            const newFileName = file.replace(/webflow/g, 'f18-built-component');
            fullDestPath = path.join(dest, newFileName);
            console.log(`Renaming file: ${file} to ${newFileName}`);
        }

        if (fs.statSync(fullSrcPath).isDirectory()) {
            // Create directory in the destination if it doesn't exist
            if (!fs.existsSync(fullDestPath)) {
                fs.mkdirSync(fullDestPath, { recursive: true });
            }
            // Recursively copy the directory
            copySourceToDist(fullSrcPath, fullDestPath);
        } else {
            // Copy non-HTML files directly
            const ext = path.extname(fullSrcPath).toLowerCase();
            if (ext !== '.html') {
                if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
                    // Optimize and copy images
                    sharp(fullSrcPath)
                        .toFormat('webp', { quality: 80 })
                        .toFile(fullDestPath.replace(ext, '.webp'))
                        .then(() => {
                            console.log(`Optimized and copied image: ${file} to ${fullDestPath.replace(ext, '.webp')}`);
                        })
                        .catch(err => {
                            console.error(`Image optimization failed for ${file}:`, err);
                        });
                } else {
                    fs.copyFileSync(fullSrcPath, fullDestPath);
                    console.log(`Copied file: ${fullSrcPath} to ${fullDestPath}`);
                }
            } else {
                // Read the HTML file content
                let content = fs.readFileSync(fullSrcPath, 'utf-8');

                // Build canonical URL (without .html extension)
                let relativePath = path.relative(sourceDir, fullSrcPath).replace('.html', '');
                relativePath = relativePath.replace(/\\/g, '/'); // For Windows paths
                let canonicalUrl = `${baseUrl}/${relativePath}`;

                // Add canonical and lang attributes, and ensure unique title tags
                content = addLangAttribute(content, defaultLang);
                content = addCanonicalTag(content, canonicalUrl);
                content = ensureUniqueTitle(content, file);  // Ensure each page has a unique title
                content = content.replace(/webflow/g, 'f18-built-component');
                content = optimiseHtml(content);

                // Write the optimized HTML content to the destination
                fs.writeFileSync(fullDestPath, content);
                console.log(`Copied and optimized HTML file: ${fullSrcPath} to ${fullDestPath}`);
            }
        }
    });
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
                // Skip .html extension in URLs for sitemap
                let relativePath = path.relative(directoryPath, fullPath).replace('.html', '');
                relativePath = relativePath.replace(/\\/g, '/'); // For Windows paths
                urls.push(`${baseUrl}/${relativePath}`);
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

// Function to add 301 redirects (optional)
function createRedirects() {
    const redirects = [
        { from: '/pricing.html', to: '/pricing' },
        // Add more redirects as necessary
    ];

    let redirectRules = '';

    redirects.forEach(rule => {
        redirectRules += `Redirect 301 ${rule.from} ${rule.to}\n`;
    });

    // Add cache-control headers
    redirectRules += `\n# Cache static assets for 1 year\n`;
    redirectRules += `/css/*  /css/:splat  200! Cache-Control: public, max-age=31536000\n`;
    redirectRules += `/js/*  /js/:splat  200! Cache-Control: public, max-age=31536000\n`;
    redirectRules += `/images/*  /images/:splat  200! Cache-Control: public, max-age=31536000\n`;

    fs.writeFileSync(path.join(distDir, '_redirects'), redirectRules);
    console.log('301 redirects and cache rules created successfully.');
}

// Function to copy service worker
function copyServiceWorker() {
    const src = path.join(sourceDir, 'service-worker.js');
    const dest = path.join(distDir, 'service-worker.js');

    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log('Service worker copied successfully.');
    } else {
        console.warn('Service worker file not found:', src);
    }
}

// Function to bundle JavaScript using Webpack
function bundleJavaScript() {
    try {
        execSync('npx webpack --config webpack.config.js', { stdio: 'inherit' });
        console.log('JavaScript bundled successfully.');
    } catch (err) {
        console.error('JavaScript bundling failed:', err);
    }
}

// Function to run Lighthouse CI
function runLighthouseCI() {
    try {
        execSync('lhci autorun', { stdio: 'inherit' });
        console.log('Lighthouse CI completed successfully.');
    } catch (err) {
        console.error('Lighthouse CI failed:', err);
    }
}

// Main function to perform all tasks
function build() {
    try {
        createDistDirectory();
        copySourceToDist(sourceDir, distDir);
        bundleJavaScript();
        optimizeCSS();
        copyServiceWorker();
        generateSitemap(distDir);
        generateRobotsTxt();
        createRedirects();
        runLighthouseCI();
        console.log('Build completed successfully.');
    } catch (err) {
        console.error('Build failed:', err);
    }
}

build();