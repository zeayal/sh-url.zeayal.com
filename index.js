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

// const db = monk(process.env.MONGODB_URL);
// const db = monk('mongodb://mongo:27017/docker-node-mongo');
const db = monk('mongo:27017/db_short_url');
db.then(() => {
  console.log('mongodb connected');
}).catch(error => {
  console.log('monogodb error', error)
})
const urls = db.get("urls");
urls.createIndex({ slug: 1 }, { unique: true });

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);
app.use(express.json());
app.use(express.static("public"));

app.get("/github", async (req, res, next) => {
  const response = await fetch("https://api.github.com/users/zeayal");
  console.log("response", response.ok);
  const data = await response.json();
  res.json({
    status: 0,
    data,
  });
});

// app.use(
//   "/scripts",
//   express.static(__dirname + "/node_modules/@pnotify/")
// );
// app.use(
//   "/style",
//   express.static(__dirname + "/node_modules/@pnotify/")
// );

const schema = yup.object().shape({
  url: yup.string().trim().url().required(),
  slug: yup
    .string()
    .trim()
    .matches(/^[\w\-]+$/i),
});

const slugSchema = yup.object().shape({
  slug: yup
    .string()
    .trim()
    .matches(/^[\w\-]+$/i),
});

const notFoundPath = path.resolve("public/404.html");

app.get("/:id", async (req, res, next) => {
  let { id: slug } = req.params;
  console.log("req.query", req.query);
  console.log("req.params", req.params);
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
  console.log( url, slug );
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

app.get('/hello', (req,res) => {
  res.send(`hello, I'm in docker`);
})

app.use((error, req, res, next) => {
  if (error.status) {
    res.status(500);
  } else {
    res.status(500);
  }
  console.log('error.stack', error.stack);
  res.json({
    status: 1,
    // message: process.env.NODE_ENV === "production" ? "🍔" : error.stack,
    message:  error.stack,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server is runing in: http://localhost:${PORT}`);
});
