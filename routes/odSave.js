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
  let SELECT_AREA_QUERY =                "SELECT area_code "
  SELECT_AREA_QUERY = SELECT_AREA_QUERY +  "FROM m_area "
  SELECT_AREA_QUERY = SELECT_AREA_QUERY + "WHERE prefectures = $1 "
  SELECT_AREA_QUERY = SELECT_AREA_QUERY +   "AND municipality = $2 "
  SELECT_AREA_QUERY = SELECT_AREA_QUERY +   "AND district = $3 "

  // 地域登録
  let INSERT_AREA_QUERY =                 "INSERT INTO m_area "
  INSERT_AREA_QUERY = INSERT_AREA_QUERY + "VALUES (nextval('area_code_seq'), $1, $2, $3, now(), now())"

  // カテゴリ登録
  let INSERT_CATEGORY_QUERY =                     "INSERT INTO m_category "
  INSERT_CATEGORY_QUERY = INSERT_CATEGORY_QUERY + "VALUES (nextval('category_code_seq'), $1, now(), now())"

  // オープンデータ検索
  let SELECT_OD_QUERY =              "SELECT * "
  SELECT_OD_QUERY = SELECT_OD_QUERY +  "FROM t_opendata "
  SELECT_OD_QUERY = SELECT_OD_QUERY + "WHERE area_code = $1 "
  SELECT_OD_QUERY = SELECT_OD_QUERY +   "AND category_code = $2 "
  
  // オープンデータ登録
  let INSERT_OD_QUERY =               "INSERT INTO t_opendata "
  INSERT_OD_QUERY = INSERT_OD_QUERY + "VALUES (nextval('od_code_seq'), $1, $2, $3, $4, $5, $6, now(), now())"

  
  // 都道府県
  let prefectures = req.body.prefectures;
  // 市区町村
  let municipality = req.body.municipality;
  // カテゴリコード
  let categoryCode = req.body.category_code;
  let categoryName = req.body.category_name;
  // オープンデータ
  let datas = req.body.data;

  // コネクション開始
  client.connect()

  // プロミス配列
  var promises = [];
  for (var i = 0; i < req.body.data.length; i++) {
    promises.push(new Promise(function (resolve, reject) {

      // 地域
      let district = datas[i].district
      // ワード
      let word = datas[i].word
      // データ
      let od = datas[i].value
      // 単位
      let unit = datas[i].unit
      // URL
      let url = datas[i].url

      // 地域
      let areaCode;
      let areaName;

      // 地域検索＆登録
      let SELECT_AREA_QUERY_PARAM = [prefectures, municipality, district]
      client.query(SELECT_AREA_QUERY, SELECT_AREA_QUERY_PARAM).then((aqResult) => {
      if (aqResult.rows.length == 0 || aqResult.rows[0] == null) {
          // 地域が0件の場合は新規登録
          // 地域登録
          let INSERT_AREA_QUERY_PARAM = [prefectures, municipality, district]
          client.query(INSERT_AREA_QUERY, INSERT_AREA_QUERY_PARAM).then((result) => {
            let message = "[" + prefectures + ", " + municipality + ", "  + district + "]の地域データを登録しました。";
            console.log(message);
          }).catch((e) => {
            reject()
            console.log(e)
          })
        } else {
          // 地域コードを設定
          areaCode = aqResult.rows[0].area_code;
          areaName = prefectures + municipality + district;
        }

        // カテゴリ登録
        if (categoryCode == null) {
          // カテゴリコードがnullの場合は新規登録
          client.query(INSERT_CATEGORY_QUERY, [categoryName]).then((result) => {
            let message = "[" + categoryName + "]の地域データを登録しました。";
            console.log(message);
          }).catch((e) => {
            reject()
            console.log(e)
          })
        }

        // オープンデータ検索＆登録
        if (areaCode != null && categoryCode != null) {
          client.query(SELECT_OD_QUERY, [areaCode, categoryCode]).then((oqResult) => {
            if (oqResult.rows.length == 0 || oqResult.rows[0] == null) {
              // オープンデータが0件の場合は新規登録
              let INSERT_OD_QUERY_PARAM = [areaCode, categoryCode, word, od, unit, url];
              client.query(INSERT_OD_QUERY, INSERT_OD_QUERY_PARAM).then((result) => {
                let message = "[" + categoryName + ", " + areaName + ", " + word + ", " + od + ", " + unit + ", " + url + "]のオープンデータを登録しました。";
                console.log(message);
              }).catch((e) => {
                reject()
                console.log(e)
              })
            } else {
              let message = "[" + categoryName + ", " + areaName + ", " + word + ", " + od + ", " + unit + ", " + url + "]のオープンデータは登録済みです。";
              console.log(message)
            }
          }).catch((e) => {
            reject()
            console.log(e)
          })
          resolve('sucsess')
        }

      }).catch((e) => {
        reject()
        console.log(e)
      })

    }))
}

  // プロミスを全て実行
  Promise.all(promises).then(function (results) {
    // コネクション終了
    client.on('drain', client.end.bind(client));
    // resultsはpromiseの結果配列
    res.send(results);
  });
})

module.exports = router
