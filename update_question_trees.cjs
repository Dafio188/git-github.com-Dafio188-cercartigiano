const fs = require('fs');

const missingTrees = fs.readFileSync('missing_trees.txt', 'utf-8');
let questionService = fs.readFileSync('src/services/questionService.ts', 'utf-8');

questionService = questionService.replace(
  "  moving_logic_shim: [ // Shim to keep indices relative if needed, but not used by UI",
  missingTrees + ",\n  moving_logic_shim: [ // Shim to keep indices relative if needed, but not used by UI"
);

fs.writeFileSync('src/services/questionService.ts', questionService);
