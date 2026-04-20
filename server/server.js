import http from "http";
import fs from "fs";
import app from "./app.js";

if (!fs.existsSync("./uploads")) {
    fs.mkdirSync("./uploads");
}

const server = http.createServer(app);

server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});