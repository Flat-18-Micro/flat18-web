// console.log('Hello world')


function listFiles(parent) {
  const fs = require('fs')
  let dir = parent ? parent : '/';
  return fs.readdirSync(dir)
}

function read(file) {
  const fs = require('fs')
  return fs.readFileSync(file, 'utf8');
}

function reCreateFolders(folder) {
  const fs = require('fs')
  folder = folder ? folder : '/dist'
  if (fs.existsSync(folder)) { fs.rmSync(folder, { recursive: true }) }
  fs.mkdirSync(folder)
}


let variables = {
  name: "Flat 18 - Web Development & Design",
  site: "https://flat18.co.uk",
}

function titlify(text) {
  text = text.replace(/_/g, ' ')
  text = text[0].toUpperCase() + text.substring(1, text.length)
  text = text === 'Homepage' ? '' : text + ' | '
  return text
}


function makePage(directory) {
  const fs = require('fs')
  let dist = ''
  let head = String(fs.readFileSync('./components/head.ejs'))
  head = head.replace(/\$name/g, variables.name)
  head = head.replace(/\$title/g, titlify(directory))
  head = head.replace(/\$site/g, variables.site)
  head = head.replace(/\$canonical/g, variables.site + '/' + directory)
  dist += head
  let nav = String(fs.readFileSync('./components/nav.ejs'))
  nav = nav.replace(/\$name/g, variables.name)

  let bodyWrapper = String(fs.readFileSync('./components/body-wrapper.ejs'))
  let body = fs.readFileSync('./pages/' + directory + '/index.ejs', { encoding: 'utf8', flag: 'r' })

  let parsedBody = {}
  let testBody = String(body).replace(/ /g, "")
  if (testBody.indexOf('[') == 0 && testBody.indexOf(']') == testBody.length - 1) {
    parsedBody.contents = assembleBody(JSON.parse(body))
  } else if (testBody.indexOf('{') == 0 && testBody.indexOf('}') == testBody.length - 1) {
    let jsonBody = JSON.parse(body)
    parsedBody.contents = assembleBody(jsonBody.contents)
    parsedBody.dir = jsonBody.destination
  }
  else {
    parsedBody.contents = body
  }

  bodyWrapper = bodyWrapper.replace(/\$nav/g, nav)
  bodyWrapper = bodyWrapper.replace(/\$body/g, parsedBody.contents)
  dist += bodyWrapper

  dist += fs.readFileSync('./components/foot.ejs')

  const extraScripts = './pages/' + directory + '/scripts.js'

  try {
    if (fs.existsSync(extraScripts)) {
      //file exists
      dist += '<script>'
      dist += fs.readFileSync(extraScripts)
      dist += '</script>'
      console.log('Files attached for ' + directory)

    }
  } catch (err) {
    // console.log('No additional files attached for ' + directory)
  }

  let subDirectory = directory === 'homepage' ? '/' : '/' + directory + '/'
  subDirectory = parsedBody.dir?parsedBody.dir: subDirectory
  console.log(subDirectory)
  try { fs.mkdirSync("./dist" + subDirectory, { recursive: true }) } catch (e) { }
  fs.writeFileSync('./dist' + subDirectory + 'index.html', dist);

}

function assembleBody(contents) {
  const fs = require('fs')
  let tmp = ''
  for (const section of contents) {
    tmp += fs.readFileSync('./pages/' + section)
  }
  return tmp
}

function getDirectories(dir) {
  const fs = require('fs');

  const directoriesInDIrectory = fs.readdirSync(dir, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name);

  return directoriesInDIrectory
}
function consolidateAssets() {
  const fs = require('fs')
  const fse = require('fs-extra');
  const sass = require('node-sass');
  const path = require('path');
  const UglifyJS = require("uglify-js")

  const directories = ['./src/css/', './src/js/']
  for (const dir of directories) {
    let data = ''
    let cssMap = ''
    let assets = listFiles(dir)
    assets = assets.filter(asset => asset.indexOf(".")>=0)
    let directory = '.' + dir.replace('./src/', '').replace(/\//g, '')
    let newFile = dir.replace("./", "./dist/") + "file" + directory
    for (const asset of assets) {
      let assetData = read(dir + asset)
      let ext = path.parse(asset).ext
      if (ext === ".map") {
        cssMap += assetData;
      }
      if (ext === ".css") {
        data += assetData + " "
      }
      if (ext === ".js") {
        data += UglifyJS.minify(assetData).code + " "
      }
      if (ext === '.scss') {
        var result = sass.renderSync({
          file: dir + asset,
          includePaths:[dir + '/components/', dir],
          data: assetData,
          outputStyle: 'compressed',
          outFile: dir + '/file.css',
          sourceMap: true,
        });


        data += result.css
        cssMap += result?.map
      }
    }
    fs.writeFileSync(newFile, data);
    fs.writeFileSync("./dist/src/css/file.css.map", cssMap);
  }


  const assetFolders = ['./src/img/', './src/fonts/']
  for (const dir of assetFolders) {
    let destDir = dir.replace('./src/', './dist/src/')
    fse.copySync(dir, destDir)
  }
}


//PERFORMING BUILD
const mainFolders = ["./dist", "./dist/src", "./dist/src/css", "./dist/src/fonts", "./dist/src/img", "./dist/src/js"]
for (const folder of mainFolders) { reCreateFolders(folder) }
consolidateAssets()

let siteMap = '<urlset>'
function makeSiteMapsEtc() {
  const fs = require('fs')
  fs.writeFileSync('./dist/site.xml', siteMap + '</urlset>');
  fs.writeFileSync('./dist/sitemap.xml', siteMap + '</urlset>');
  fs.writeFileSync('./dist/robots.txt', `
User-agent: *
Disallow: /src/

User-agent: Googlebot
Allow: /src/

Sitemap: https://flat18.co.uk/sitemap.xml
`);
}

for (const directory of getDirectories('./pages')) {
  let date = new Date()
  // console.log(date)
  siteMap += `<url>
  <loc>${variables.site + '/' + directory}</loc>
  <lastmod>${date}</lastmod>
  <changefreq>monthly</changefreq>
  <priority>1</priority>
</url>`;
  makePage(directory)
}

makeSiteMapsEtc()



