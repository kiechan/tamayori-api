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

  let code = 0
  if (req.body.area_code != null) {
      code = req.body.area_code
  }
  console.log(req.body.area_code)

  let queryStr =        "SELECT area_code, municipality "
  queryStr = queryStr +   "FROM m_area "
  queryStr = queryStr +  "WHERE prefectures = (SELECT prefectures FROM m_area WHERE area_code = $1) "
  queryStr = queryStr +    "AND municipality IS NOT NULL "
  queryStr = queryStr +    "AND district IS NULL "
  queryStr = queryStr +  "GROUP BY (area_code, municipality) "

  client.query(queryStr, [req.body.area_code]).then((result) => {
    const rows = result.rows
    const responseData = rows.map(r => {
      return {
        code : r.area_code,
        name : r.municipality
      }
    })
    res.send(responseData);
  }).catch((e) => {
    res.send({ message: JSON.stringify(e)});
  })
})

module.exports = router
