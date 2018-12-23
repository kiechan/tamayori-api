var express = require('express');
var router = express.Router();
const { Client } = require('pg')

/* GET home page. */
router.get('', (req, res) => {

  const client = new Client({
    user: 'root',
    host: 'udc2019-aws-db.ctdjivyul3eu.ap-northeast-1.rds.amazonaws.com',
    database: 'udc2019_aws_db',
    password: 'rootroot',
    port: 5432
  })

  client.connect()

  let queryStr =        "SELECT category_code, category_name "
  queryStr = queryStr +   "FROM m_category"

  client.query(queryStr).then((result) => {
    const rows = result.rows
    const responseData = rows.map(r => {
      return {
        code : r.category_code,
        name : r.category_name
      }
    })
    res.send(responseData);
  }).catch((e) => {
    res.send({ message: JSON.stringify(e)});
  })
})

module.exports = router
