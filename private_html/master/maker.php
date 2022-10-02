<?php

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);
include(__DIR__ . '/functions.php');
include('/var/www/apps.local/minifier/vendor/autoload.php');

use MatthiasMullie\Minify;



$dir = new DirectoryIterator(__DIR__ . "/pages/");
$url = isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : "flat18.co.uk";

file_put_contents(__DIR__ . "/../../public_html/site.xml", '<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

</urlset>');


$css = __DIR__ . "/src/css/style.css";
$fontawesome = '/var/www/includes_/assets/css/fontawesome-5.8.2-all.css';
$systemFont0 = "/var/www/includes_/assets/css/dm-serif-display.css";
$systemFont1 = "/var/www/includes_/assets/css/montserrat.css";
$emoji = "/var/www/includes_/assets/css/emoji.css";
$js = __DIR__ . "/src/js/script.js";

// if (
//   is_file($fontawesome . ".ultra-min.css")
//   && is_file($systemFont0 . ".ultra-min.css")
//   && is_file($systemFont1 . ".ultra-min.css")
//   && is_file($emoji . ".ultra-min.css")
// ) {
//   $fontawesome = file_get_contents('/var/www/includes_/assets/css/fontawesome-5.8.2-all.css.ultra-min.css');
//   $systemFont0 = file_get_contents("/var/www/includes_/assets/css/dm-serif-display.css.ultra-min.css");
//   $systemFont1 = file_get_contents("/var/www/includes_/assets/css/montserrat.css.ultra-min.css");
//   $emoji = file_get_contents("/var/www/includes_/assets/css/emoji.css.ultra-min.css");
// } else {
  $fontawesome = new Minify\CSS($fontawesome);
  $fontawesome = $fontawesome->minify();
  $systemFont0 = new Minify\CSS($systemFont0);
  $systemFont0 = $systemFont0->minify();
  $systemFont1 = new Minify\CSS($systemFont1);
  $systemFont1 = $systemFont1->minify();
  $emoji = new Minify\CSS($emoji);
  $emoji = $emoji->minify();

  file_put_contents('/var/www/includes_/assets/css/fontawesome-5.8.2-all.css.ultra-min.css', $fontawesome);
  file_put_contents("/var/www/includes_/assets/css/dm-serif-display.css.ultra-min.css", $systemFont0);
  file_put_contents("/var/www/includes_/assets/css/montserrat.css.ultra-min.css", $systemFont1);
  file_put_contents("/var/www/includes_/assets/css/emoji.css.ultra-min.css", $emoji);
// }

$css = new Minify\CSS($css);
$css = $css->minify();
$js = new Minify\JS($js);
$js = $js->minify();

file_put_contents(__DIR__ . "/src/css/style.css.ultra-min.css", $css);
file_put_contents(__DIR__ . "/src/js/script.js.ultra-min.css", $js);

$css = file_get_contents(__DIR__ . "/src/css/style.css.ultra-min.css");
$js = file_get_contents(__DIR__ . "/src/js/script.js.ultra-min.css");



$siteXML = file_get_contents(__DIR__ . "/../../public_html/site.xml");
$builtXML = "";
$dateNow = Date('Y-m-d', strtotime("now"));


$scriptAux = "";
$styleAux = "";

foreach ($dir as $fileinfo) {
  if (!$fileinfo->isDot()) {
    $n = $fileinfo->getFilename();
    $subfolder = __DIR__ . "/pages/" . $n;
    switch ($n) {
      case 'homepage':
        //HOMEPAGE-SPECIFIC 
        $body = file_get_contents($subfolder . "/body.html");
        $tmpl = file_get_contents(__DIR__ . "/templates/page.html");
        $dest = ['/', '/homepage/', '/home/'];
        break;
      default:
        if (is_dir($subfolder)) {
          if (is_file($subfolder . "/body.html")) {
            // PAGE HASN'T BEEN BUILT YET BUT WILL BE LATER IN THIS CALL
            $body = file_get_contents($subfolder . "/body.html");
            if (is_file($subfolder . "/" . $n . ".min.js")) {
              $scriptAux = file_get_contents($subfolder . "/" . $n . ".min.js");
            }
            if (is_file($subfolder . "/" . $n . ".min.css")) {
              $styleAux = file_get_contents($subfolder . "/" . $n . ".min.css");
            }
          } else {
            //PAGE DOESN'T EXIST
            $body = file_get_contents(__DIR__ . "/pages/404/body.html");
          }
        } else {
          //PAGE DOESN'T EXIST
          $body = file_get_contents(__DIR__ . "/pages/404/body.html");
        }
        $tmpl = file_get_contents(__DIR__ . "/templates/page.html");
        $dest = ['/' . $n . '/'];
    } //END SWITCH

    $header = file_get_contents(__DIR__ . "/html/header.html");
    $footer = file_get_contents(__DIR__ . "/html/footer.html");

    $title = isset($n) ? cleanTitle($n) . " | " : "";

    $site = "Flat 18";
    $metaDescription = "Websites, Apps, Crypto. Let's chat about your next big idea.";
    $metaKeywords = "web development trinidad, web developer trinidad, web developer united kingdom, web developer ireland, web development company, crypto system developers, build a website, build an app, build a crypto service,web development, design, development, website, server, hosting, domains, email, mobile apps, corporate apps, HTML,CSS,XML,JavaScript, btcpay, design, logos, webdesign, illustrations, graphic design, small business, servers, fullstack, ubuntu, troubleshootings, bitcoin, btcpayserver, cryptocurrencies, crypto, nativescript, apps, payment processor, payment processing, accept bitcoin online, build a website, crypto enthusiast, fintech, defi, remote, united kingdom, ireland, britain, british, rebel, money, affordable, open source, opensource, github, git, network";
    $metaImage = "https://" . $url . "/img/favicon.png";
    $canonical = $n;
    $subdirectory = $n == 'homepage' ? "/" : "/" . $n;
    $keys = ['$metaImage', '$subdirectory', '$metaDescription', '$metaKeywords', '$body', '$title', '$canonical', '$css', '$js', '$fontawesome', '$systemFont0', '$systemFont1', '$emoji', '../fonts', '$url', '$site', '$header', '$footer', '$scriptAux', '$styleAux'];
    $replace = [$metaImage, $subdirectory, $metaDescription, $metaKeywords, $body, $title, $canonical, $css, $js, $fontawesome, $systemFont0, $systemFont1, $emoji, 'https://include.flat18.co.uk/fonts', $url, $site, $header, $footer, $scriptAux, $styleAux];

    $tmpl = str_replace($keys, $replace, $tmpl);

    $builtXML .= '<url>
                    <loc>https://' . $url . '/' . $n . '</loc>
                    <lastmod>' . $dateNow . 'T00:00:00-00:00</lastmod>
                    <changefreq>monthly</changefreq>
                    <priority>1</priority>
                  </url>
                
                ';

    foreach ($dest as $d) {
      $destination = __DIR__ . "/../../public_html" . $d;
      if (!is_dir($destination)) {
        mkdir($destination);
      }

        doClone("src/img");
        // doClone("workers");
        file_put_contents($destination . "index.html", $tmpl);
        echo ("<br>Built " . $n . "at ".$destination."\n\n");
    }
  }
}

$builtXML .= "</urlset>";
$newSiteXML = str_replace("</urlset>", $builtXML, $siteXML);
file_put_contents(__DIR__ . "/../../public_html/site.xml", $newSiteXML);
file_put_contents(__DIR__ . "/../../public_html/sitemap.xml", $newSiteXML);

