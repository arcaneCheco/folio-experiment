import express from "express";
import * as path from "path";
import { fileURLToPath } from "url";

const app = express();

const PORT = 1234;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(`${__dirname}/dist`));

app.set("view engine", "pug");
app.set("index", `${__dirname}/views`);

app.get("/", async (req, res) => {
  res.render("index");
});

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});

export default app;
