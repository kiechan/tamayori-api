var express = require('express');
var router = express.Router();
const { Client } = require('pg')

/* GET home page. */
router.post('', (req, res) => {

  const client = new Client({
    user: 'root',
    host: 'udc2019-aws-db.ctdjivyul3eu.ap-northeast-1.rds.amazonaws.com',
    database: 'udc2019_aws_db',
    password: 'rootroot',
    port: 5432
  })

  // 地域検索
  let SELECT_AREA_QUERY = "SELECT count(area_code) count "
  SELECT_AREA_QUERY = SELECT_AREA_QUERY + "FROM m_area "
  SELECT_AREA_QUERY = SELECT_AREA_QUERY + "WHERE prefectures = $1 "
  SELECT_AREA_QUERY = SELECT_AREA_QUERY + "AND municipality = $2 "
  SELECT_AREA_QUERY = SELECT_AREA_QUERY + "AND district = $3 "
  SELECT_AREA_QUERY = SELECT_AREA_QUERY + "GROUP BY (area_code) "

  // 地域登録
  let INSERT_AREA_QUERY = "INSERT INTO m_area"
  INSERT_AREA_QUERY = INSERT_AREA_QUERY + "VALUES (4, $1, $2, $3, now(), now())"

  let prefectures = req.body.prefectures
  let municipality = req.body.municipality
  let datas = req.body.data

  client.connect()

  // プロミス配列
  var promises = [];
  for (var i = 0; i < req.body.data.length; i++) {
    promises.push(new Promise(function (resolve, reject) {

      let district = datas[i].district

      // 地域検索
      client.query(SELECT_AREA_QUERY, [prefectures, municipality, district]).then((result) => {
        const count = result.rows
        // console.log(count)
        // if (count == 0) {
        // // 地域が0件の場合は新規登録
        // // 地域登録
        // let INSERT_AREA_QUERY_PARAM = [prefectures, municipality, district]
        // client.query(INSERT_AREA_QUERY, INSERT_AREA_QUERY_PARAM).then((result) => {
        // }).catch((e) => {
        //   reject({ message: JSON.stringify(e)});
        // })
        // }

        resolve(result.rows)
      }).catch((e) => {
        reject(e)
      })
    }))
  }

  // プロミスを全て実行
  Promise.all(promises).then(function (results) {
    // resultsはpromiseの結果配列
    res.send(results);
    client.end()
  });
})

module.exports = router
