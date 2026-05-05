import fs from 'fs';
import https from 'https';
import http from 'http';

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const getFn = url.startsWith('https') ? https : http;
    
    getFn.get(url, function(response) {
      if (response.statusCode === 301 || response.statusCode === 302) {
         download(response.headers.location, dest).then(resolve).catch(reject);
         return;
      }
      response.pipe(file);
      file.on('finish', function() {
        file.close(resolve);
      });
    }).on('error', function(err) {
      fs.unlink(dest, () => {});
      reject(err.message);
    });
  });
}

async function main() {
  await download('https://ais-pre-fxgevb6ofl6sydp2gvbfdw-95277734485.europe-west1.run.app/logo.png', 'public/logo.png');
  await download('https://ais-pre-fxgevb6ofl6sydp2gvbfdw-95277734485.europe-west1.run.app/Foto_homepage.png', 'public/Foto_homepage.png');
  console.log("Downloaded!");
}
main();
