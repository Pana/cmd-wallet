const level = require("level");


const db = level("./levelDB");



;(async function () {
    await db.put("hello", "world");
    let val = await db.get("hello");
    console.log(val);
})();