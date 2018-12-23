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

  let queryStr =        "SELECT COALESCE(ma.district, ma.municipality, ma.prefectures) area "
  queryStr = queryStr +    ", * "
  queryStr = queryStr + "FROM t_opendata tod "
  queryStr = queryStr + "LEFT JOIN m_category mc "
  queryStr = queryStr +        "ON tod.category_code = mc.category_code "
  queryStr = queryStr + "LEFT JOIN m_area ma "
  queryStr = queryStr +        "ON tod.area_code = ma.area_code "

  client.query(queryStr).then((result) => {
    const rows = result.rows
    const responseData = rows.map(r => {
      return {
        code: r.od_code,
        category: r.category_name,
        area: ((r.prefectures) ? r.prefectures : '') + ((r.municipality) ? r.municipality : '') + ((r.district) ? r.district : ''),
        word: r.word,
        value: r.value,
        unit: r.unit,
        url: r.url
      }
    })
    res.send(responseData);
  }).catch((e) => {
    res.send({ message: JSON.stringify(e)});
  })
})

module.exports = router
