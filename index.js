const express = require("express");
const morgan = require("morgan");
const { nanoid } = require("nanoid");
const yup = require("yup");
const monk = require("monk");
const app = express();
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
require("dotenv").config();

const db = monk(process.env.MONGODB_URL);
const urls = db.get("urls");
urls.createIndex({ slug: 1 }, { unique: true });

app.set("view engine", "pug");
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.json("hello json");
});

app.get("/error", (req, res) => {
  throw new Error("test error message");
});

app.get("/file", (req, res, next) => {
  fs.readFile(path.resolve(__dirname, "hello。.txt"), function (err, data) {
    if (err) {
      console.log("没有抛出异常，可能会中断程序 err");
      next(err);
    } else {
      res.send(data);
    }
  });
});

app.get("/github", async (req, res, next) => {
  const response = await fetch("https://api.github.com/users/zeayal");
  console.log("response", response.ok);
  const data = await response.json();
  res.json({
    status: 0,
    data,
  });
});

const schema = yup.object().shape({
  url: yup.string().trim().url().required(),
  slug: yup
    .string()
    .trim()
    .matches(/^[\w\-]+$/i),
});

const slugSchema = yup.object().shape({
  slug: yup.string().trim().matches(/^[\w\-]+$/i),
});

app.get(
  "/writeToFile",
  function (req, res, next) {
    fs.writeFile("hello3.txt", "test data", next);
  },
  function (req, res) {
    res.send("OK");
  }
);

app.get("/mustCatchError", function (req, res, next) {
  setTimeout(() => {
    //
    Promise.resolve(1)
      .then((data) => {
        console.log("data", data);
        // res.send("ok");
        throw new Error("test error");
      })
      .catch(next);
  }, 100);
});

const notFoundPath = path.resolve('public/404.html')

app.get("/:id", async (req, res, next) => {
  let { id: slug } = req.params;
  console.log('req.query', req.query)
  console.log('req.params', req.params);
  try {
    const valid = await slugSchema.validate({ slug });
    if (valid) {
      const data = await urls.findOne({ slug });
      res.redirect(data.url);
    } else {
      res.status(404).sendFile(notFoundPath);
    }
  } catch (e) {
    res.status(404).sendFile(notFoundPath);
  }
});

app.post("/url", async (req, res, next) => {
  let { url, slug } = req.body;
  try {
    if (!slug) {
      slug = nanoid(5);
    }
    const valid = await schema.validate({ url, slug });
    if (valid) {
      const existing = await urls.findOne({ slug });
      if (existing) {
        throw new Error("Slug in use. 🍔");
      }
      const data = await urls.insert({
        url,
        slug,
      });

      res.json({
        status: 0,
        data,
        message: "新增成功",
      });
    }
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  if (error.status) {
    res.status(500);
  } else {
    res.status(500);
  }
  res.json({
    status: 1,
    message: process.env.NODE_ENV === "production" ? "🍔" : error.stack,
  });
});

const PORT = process.env.PORT || 1323;

app.listen(PORT, () => {
  console.log(`server is runing in: http://localhost:${PORT}`);
});
