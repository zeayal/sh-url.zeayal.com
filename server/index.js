const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.json("hello json");
})


app.post('/url', (req, res) => {
    const body = req.body;
    res.json({
        body
    })
})

const PORT = process.env.PORT || 1323;

app.listen(PORT, () => {
    console.log(`server is runing in: http://localhost:${PORT}`)
})