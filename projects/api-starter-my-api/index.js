import express from 'express'
const app = express()
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.json({ message: 'My API API is running' })
})

app.listen(port, () => {
  console.log('My API API listening on port ' + port)
})