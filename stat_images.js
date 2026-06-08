import fs from "fs";
const logoSize = fs.statSync("public/logo.png").size;
const bgSize = fs.statSync("public/Foto_homepage.png").size;
console.log(`logo.png is ${logoSize} bytes`);
console.log(`Foto_homepage.png is ${bgSize} bytes`);
