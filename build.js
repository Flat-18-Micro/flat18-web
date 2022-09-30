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
  if (fs.existsSync(folder)) { fs.rmdirSync(folder, { recursive: true }) }
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

  let bodyWrapper = String(fs.readFileSync('./components/body-wrapper.ejs'))
  let body = fs.readFileSync('./pages/' + directory + '/index.ejs')

  body = parseBody(body)

  bodyWrapper = bodyWrapper.replace(/\$nav/g, nav)
  bodyWrapper = bodyWrapper.replace(/\$body/g, body)
  dist += bodyWrapper

  dist += fs.readFileSync('./components/foot.ejs')
  // dist += fs.readFileSync('./components/scripts.ejs')

  const extraScripts = './pages/' + directory + '/scripts.js'

  try {
    if (fs.existsSync(extraScripts)) {
      //file exists
      dist += '<script>'
      dist += fs.readFileSync(extraScripts)
      dist += '</script>'
      // console.log('Files attached for ' + directory)

    }
  } catch (err) {
    // console.log('No additional files attached for ' + directory)
  }

  let subDirectory = directory === 'homepage' ? '/' : '/' + directory + '/'
  if (subDirectory.length > 1) {
    reCreateFolders('./dist/' + directory)
  }
  fs.writeFileSync('./dist' + subDirectory + 'index.html', dist);

}

function parseBody(body) {
  const fs = require('fs')
  let parsedBody = ''
  try {
    body = JSON.parse(body)
    if (Array.isArray(body)) {
      // console.log("array")
      for (const section of body) {
        parsedBody += fs.readFileSync('./pages/' + section)
      }
      //loop over components and add to body
    }
  } catch (err) {
    // console.log("html")
    parsedBody = body
  }
  return parsedBody
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
  const postcss = require('postcss')
  const cssnano = require('cssnano')
  // const autoprefixer = require('autoprefixer')

  const directories = ['./src/css/', './src/js/']
  for (const dir of directories) {
    let data = ''
    let asset = listFiles(dir)
    let ext = '.' + dir.replace('./src/', '').replace(/\//g, '')
    let newFile = dir.replace("./", "./dist/") + "file" + ext
    for (const ass of asset) {
      if (ass.indexOf(ext) >= ass.length - ext.length) {
        data += read(dir + ass) + " "
      }
      else if (ass.indexOf(ext + '.map') >= 0) {
        fs.writeFileSync(dir.replace("./", "./dist/") + ass, read(dir + ass));
      }
    }
    if (ext === '.css') {
      // data = processCSS(data, newFile)
      postcss([cssnano]).process(data, { from: false }).then((result) => {
        fs.writeFileSync(newFile, result);   
        })
return
    }
    fs.writeFileSync(newFile, data);
  }

  // function processCSS(data, newFile) {
  //   postcss([cssnano]).process(data, { from: false }).then((result) => {
  //   fs.writeFileSync(newFile, result);   
  //   })
  // }


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



