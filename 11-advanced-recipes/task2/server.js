import { createServer } from 'http'
//import { totalSales } from './totalSales.js'
// import { totalSales } from './totalSalesBatch.js'
// import { totalSales } from './totalSalesCache.js'

import { totalSales } from './totalSalesCache.js';

createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost')
  const product = url.searchParams.get('product')
  console.log(`Processing query: ${url.search}`)

  totalSales(product, (err, sum) => {
    res.setHeader('Content-Type', 'application/json')
    res.writeHead(200)
    res.end(JSON.stringify({
      product,
      sum
    }))
  })

  
}).listen(8000, () => console.log('Server started'))
