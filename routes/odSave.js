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

  let prefectures = req.body.prefectures
  let municipality = req.body.municipality
  let  = req.body.data
  let distrdatasict = req.body.data[0].district

  function mainPromise(i) {
    new Promise(function (resolve, reject) {

      resolve(req.body.data[i])
      console.log(req.body.data[i])


    });
  }
  

  var promises = [];
  for (var i = 0; i < req.body.data.length; i++) {
    promises.push(mainPromise(i));
  }
  Promise.all(promises).then(function (results) {
    // results配列の各要素で結果が取れる
    // res.send("HELLO");
    res.send(results);
  });

  // // 地域検索
  // let SELECT_AREA_QUERY =                 "SELECT count(area_code) count "
  // SELECT_AREA_QUERY = SELECT_AREA_QUERY +   "FROM m_area "
  // SELECT_AREA_QUERY = SELECT_AREA_QUERY +  "WHERE area_code = $1 "
  // SELECT_AREA_QUERY = SELECT_AREA_QUERY +  "GROUP BY (area_code) "
  // let SELECT_AREA_QUERY_PARAM = [prefectures, municipality, district]

  // // 地域登録
  // let INSERT_AREA_QUERY =                 "INSERT INTO m_area"
  // INSERT_AREA_QUERY = INSERT_AREA_QUERY + "VALUES (4, $1, '市区町村', '地域', now(), now())"
  // let INSERT_AREA_QUERY_PARAM = [prefectures, municipality, district]

  // client.connect()
  // client.query(SELECT_AREA_QUERY, SELECT_AREA_QUERY_PARAM).then((result) => {
  //   const count = result.rows[0].count
  //   if (count == 0) {
  //     // 地域が0件の場合は新規登録
  //     client.query(INSERT_AREA_QUERY, INSERT_AREA_QUERY_PARAM).then((result) => {
  //     }).catch((e) => {
  //       res.send({ message: JSON.stringify(e)});
  //     })
  //   }

  //   const responseData = rows.map(r => {
  //     return {
  //       count : r.count
  //     }
  //   })
  //   res.send(responseData);
  // }).catch((e) => {
  //   res.send({ message: JSON.stringify(e)});
  // })
})

module.exports = router
