const express = require('express');
const morgan = require('morgan');
const {nanoid} = require('nanoid');

const monk = require('monk');
const app = express();

require('dotenv').config();

const db = monk(process.env.MONGODB_URL);
const urls = db.get('urls');
urls.createIndex({slug: 1}, {unique: true});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
app.use(express.json());
app.use(express.static('public'));

// app.get('/', (req, res) => {
//     res.json("hello json");
// })


app.post('/url', (req, res) => {
    let {url, slug} = req.body;
    console.log('url body', req.body);
    if(!slug) {
        slug = nanoid(5);
    }
    urls.insert({
        url,
        slug,
    })

    res.json({
        status: 0,
        message: '新增成功'
    })
})

const PORT = process.env.PORT || 1323;

app.listen(PORT, () => {
    console.log(`server is runing in: http://localhost:${PORT}`)
})