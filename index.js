const express = require("express");
const morgan = require("morgan");
const { nanoid } = require("nanoid");
const yup = require("yup");
const monk = require("monk");
const app = express();

require("dotenv").config();

const db = monk(process.env.MONGODB_URL);
const urls = db.get("urls");
urls.createIndex({ slug: 1 }, { unique: true });

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.json("hello json");
});

// const urlSchema = yup.object().shape({
//   url: yup.string().trim().url().required(),
//   slug: yup.string().trim(),
// });

const schema = yup.object().shape({
    slug: yup.string().trim().matches(/^[\w\-]+$/i),
    url: yup.string().trim().url().required(),
  });
  

app.post("/url", async (req, res) => {
  let { url, slug } = req.body;
  console.log("url body", req.body);

  try {
    const valid = await schema.validate({ url, slug });
    if (valid) {
      if (!slug) {
        slug = nanoid(5);
      }
      urls.insert({
        url,
        slug,
      });

      res.json({
        status: 0,
        message: "新增成功",
      });
    }
  } catch (error) {
    console.log("error", error);
    res.json({
      status: 1,
      message: "新增失败2",
    });
  }
});

const PORT = process.env.PORT || 1323;

app.listen(PORT, () => {
  console.log(`server is runing in: http://localhost:${PORT}`);
});
