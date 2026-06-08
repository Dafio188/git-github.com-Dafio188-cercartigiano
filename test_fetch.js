import fetch from "node-fetch";
(async () => {
    const res = await fetch("http://localhost:3000/logo.png");
    console.log("Status:", res.status);
    console.log("Headers:", res.headers.raw());
})();
