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

  let queryStr =        "SELECT area_code, prefectures FROM m_area "
  queryStr = queryStr +  "WHERE municipality IS null"

  client.query(queryStr).then((result) => {
    const rows = result.rows
    const responseData = rows.map(r => {
      return {
        id : r.area_code,
        name : r.prefectures
      }
    })
    res.send(responseData);
  }).catch((e) => {
    res.send({ message: JSON.stringify(e)});
  })
})

module.exports = router
