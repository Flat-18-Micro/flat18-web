const fs = require('fs');
const path = require('path');

// Directories
const sourceDir = path.join(__dirname, 'source');
const distDir = path.join(__dirname, 'dist');

// Function to create the dist directory if it doesn't exist
function createDistDirectory() {
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir);
        console.log('dist directory created successfully.');
    }
}

// Function to copy files from source to dist directory
function copySourceToDist(src, dest) {
    const files = fs.readdirSync(src);

    files.forEach(file => {
        const fullSrcPath = path.join(src, file);
        const fullDestPath = path.join(dest, file);

        if (fs.statSync(fullSrcPath).isDirectory()) {
            // Create directory in the destination if it doesn't exist
            if (!fs.existsSync(fullDestPath)) {
                fs.mkdirSync(fullDestPath);
            }
            // Recursively copy the directory
            copySourceToDist(fullSrcPath, fullDestPath);
        } else {
            // Copy file to the destination
            fs.copyFileSync(fullSrcPath, fullDestPath);
        }
    });
}

// Function to generate sitemap.xml
function generateSitemap(directoryPath) {
    const baseUrl = 'https://flat18.co.uk'; // Replace with your actual website URL
    let urls = [];

    // Recursively search for HTML files in the directory
    function findHtmlFiles(dir) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                findHtmlFiles(fullPath);
            } else if (path.extname(file) === '.html') {
                let relativePath = path.relative(directoryPath, fullPath);
                urls.push(`${baseUrl}/${relativePath.replace(/\\/g, '/')}`);
            }
        });
    }

    findHtmlFiles(directoryPath);

    // Generate sitemap.xml content
    let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    urls.forEach(url => {
        sitemapContent += `  <url>\n    <loc>${url}</loc>\n  </url>\n`;
    });
    sitemapContent += `</urlset>`;

    // Write the sitemap.xml file to the dist directory
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapContent);
    console.log('sitemap.xml generated successfully in dist directory.');
}

// Function to generate robots.txt
function generateRobotsTxt() {
    const robotsContent = `User-agent: *\nAllow: /\n\nSitemap: https://flat18.co.uk/sitemap.xml`; // Replace with your actual website URL
    fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsContent);
    console.log('robots.txt generated successfully in dist directory.');
}

// Main function to perform all tasks
function build() {
    createDistDirectory();
    copySourceToDist(sourceDir, distDir);
    generateSitemap(sourceDir);
    generateRobotsTxt();
}

build();