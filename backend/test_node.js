console.log("HELLO_WORLD_READY");
const fs = require('fs');
fs.writeFileSync("hello.txt", "Ready at " + new Date().toISOString());
console.log("HELLO_WORLD_DONE");
