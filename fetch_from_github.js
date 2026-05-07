import fs from "fs";
import https from "https";

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
         download(response.headers.location, dest).then(resolve).catch(reject);
         return;
      }
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

(async () => {
    try {
        await download("https://raw.githubusercontent.com/Dafio188/cercartigiano/main/public/logo.png", "public/logo.png");
        await download("https://raw.githubusercontent.com/Dafio188/cercartigiano/main/public/Foto_homepage.png", "public/Foto_homepage.png");
        console.log("Downloaded images from github.");
        const logoCode = fs.readFileSync("public/logo.png").slice(0,8).toString('hex');
        console.log("logo.png starts with:", logoCode);
    } catch(e) {
        console.error(e);
    }
})();
