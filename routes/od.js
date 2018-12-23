var express = require('express');
var router = express.Router();
const { Client } = require('pg')
require('date-utils');

/* GET home page. */
router.get('/:code', (req, res) => {
  const client = new Client({
    user: 'root',
    host: 'udc2019-aws-db.ctdjivyul3eu.ap-northeast-1.rds.amazonaws.com',
    database: 'udc2019_aws_db',
    password: 'rootroot',
    port: 5432
  })

  client.connect()

  let queryStr = "SELECT COALESCE(ma.district, ma.municipality, ma.prefectures) area "
  queryStr = queryStr + ", * "
  queryStr = queryStr + "FROM t_opendata tod "
  queryStr = queryStr + "LEFT JOIN m_category mc "
  queryStr = queryStr + "ON tod.category_code = mc.category_code "
  queryStr = queryStr + "LEFT JOIN m_area ma "
  queryStr = queryStr + "ON tod.area_code = ma.area_code "
  queryStr = queryStr + "WHERE tod.od_code = " + req.params.code

  client.query(queryStr).then((result) => {
    const rows = result.rows
    if (!rows || rows.length == 0) {
      res.send({})
      return
    }
    const responseData = {
      code: rows[0].od_code,
      category: rows[0].category_name,
      area: ((rows[0].prefectures) ? rows[0].prefectures : '') + ((rows[0].municipality) ? rows[0].municipality : '') + ((rows[0].district) ? rows[0].district : ''),
      word: rows[0].word,
      value: rows[0].value,
      unit: rows[0].unit,
      url: rows[0].url,
      createDatetime: rows[0].crete_datetime,
      updateDatetime: rows[0].update_datetime
    }
    res.send(responseData);
  }).catch((e) => {
    res.send({ message: 'failed.' });
  })
});

router.post('/', (req, res) => {

  const SELECT_QUERY = `
  SELECT
    COUNT(*) as count
  FROM
    t_opendata
  `

  const INSERT_QUERY =
    `
  INSERT INTO t_opendata(
    od_code,
    area_code,
    category_code,
    word,
    value,
    unit,
    url,
    crete_datetime,
    update_datetime
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9
  )
  `
  const dt = new Date();

  const client = new Client({
    user: 'root',
    host: 'udc2019-aws-db.ctdjivyul3eu.ap-northeast-1.rds.amazonaws.com',
    database: 'udc2019_aws_db',
    password: 'rootroot',
    port: 5432
  })

  client.connect()

  client.query(SELECT_QUERY).then(result => {
    const code = Number(result.rows[0].count) + 1
    const postParam = [
      code,
      1,
      1,
      req.body.word,
      req.body.value,
      req.body.unit,
      req.body.url,
      dt,
      dt
    ]
    client.query(INSERT_QUERY, postParam).then((result) => {
      res.send(result)
    }).catch((e) => {
      res.send({ message: JSON.stringify(e) });
    })
  })
})

router.put('/:code', (req, res) => {

  console.log(req)

  const UPDATE_QUERY = `
  UPDATE t_opendata SET
    word = $1,
    value = $2,
    unit = $3,
    url = $4,
    update_datetime = $5
  WHERE od_code = $6
  `

  const now = new Date();

  const putParam = [
    req.body.word,
    req.body.value,
    req.body.unit,
    req.body.url,
    now,
    Number(req.params.code)
  ]
  console.log(putParam)

  const client = new Client({
    user: 'root',
    host: 'udc2019-aws-db.ctdjivyul3eu.ap-northeast-1.rds.amazonaws.com',
    database: 'udc2019_aws_db',
    password: 'rootroot',
    port: 5432
  })
  client.connect()

  client.query(UPDATE_QUERY, putParam).then(result => {
    console.log(result)
    res.send(result)
  }).catch(err => {
    console.log(err)
  })
})

module.exports = router;

