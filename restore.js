import { execSync } from 'child_process';
try {
  execSync('git checkout public/logo.png public/Foto_homepage.png');
  console.log("Restored!");
} catch (e) {
  console.error(e.toString());
}
