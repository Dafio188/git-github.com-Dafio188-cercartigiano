import fs from "fs";
import https from "https";

https.get("https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json", (res) => {
    let data = "";
    res.on("data", chunk => data += chunk);
    res.on("end", () => {
        const comuni = JSON.parse(data);
        const puglia = comuni.filter(c => c.regione.nome === "Puglia").map(c => ({
            comune: c.nome,
            provincia: c.sigla, // BA, BT, BR, FG, LE, TA
            cap: c.cap[0]
        }));
        fs.writeFileSync("src/pugliaComuni.json", JSON.stringify(puglia, null, 2));
        console.log(`Saved ${puglia.length} comuni!`);
    });
});
