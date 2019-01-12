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

  // カテゴリ検索
  let SELECT_CATEGORY_QUERY =                    "SELECT category_code "
  SELECT_CATEGORY_QUERY = SELECT_CATEGORY_QUERY +  "FROM m_category "
  SELECT_CATEGORY_QUERY = SELECT_CATEGORY_QUERY + "WHERE category_name = $1 "

  // オープンデータ検索
  let SELECT_OD_QUERY =              "SELECT * "
  SELECT_OD_QUERY = SELECT_OD_QUERY +  "FROM t_opendata "
  SELECT_OD_QUERY = SELECT_OD_QUERY + "WHERE area_code = $1 "
  SELECT_OD_QUERY = SELECT_OD_QUERY +   "AND category_code = $2 "
  
  // オープンデータ登録
  let INSERT_OD_QUERY =               "INSERT INTO t_opendata "
  INSERT_OD_QUERY = INSERT_OD_QUERY + "VALUES (nextval('od_code_seq'), $1, $2, $3, $4, $5, $6, now(), now())"

  // 取得データ
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
  console.log("--- client connect start ---")

  // プロミス配列
  var promises = [];
  
  // カテゴリ登録プロミス
  promises.push(new Promise(function (resolve, reject) {
    console.log("--- category judgment promis start ---")

    // if (categoryCode != null || categoryCode != undefined) {
    //   // カテゴリコードが存在する場合は処理終了
    //   let message = "成功。カテゴリは既に存在します。（カテゴリコード：" + categoryCode + "）";
    //   console.log(message)
    //   resolve(message)

    // } else 
    if (categoryName == null) {
      // カテゴリ名が存在しない場合は処理終了
      let message = "失敗。カテゴリ名が入力されていません。";
      console.log(message)
      resolve(message)

    } else {
      // カテゴリ検索
      client.query(SELECT_CATEGORY_QUERY, [categoryName]).then((cqResult) => {
        if (cqResult.rows.length > 0 && cqResult.rows[0] != null) {
          // カテゴリが存在する場合は処理終了
          // 既存のカテゴリを使ってオープンデータを登録するため成功
          let message = "成功。カテゴリは既に存在します。（カテゴリコード：" + cqResult.rows[0].category_code + ",カテゴリ名：" + categoryName + "）";
          console.log(message)
          // reject(message);
          resolve(message)

        } else {
          // カテゴリ登録
          client.query(INSERT_CATEGORY_QUERY, [categoryName]).then((result) => {
            // 登録成功したので処理終了
            let message = "成功。カテゴリデータを登録しました。（カテゴリ名：" + categoryName + "）";
            console.log(message);
            resolve(message)

          }).catch((e) => {
            let message = "カテゴリ登録NG";
            console.log(message + " : " + e)
            // reject()
            resolve(message)
          })
        }

      }).catch((e) => {
        let message = "カテゴリ検索NG";
        console.log(message + " : " + e)
        // reject()
        resolve(message)
      })
    }
  }))

  for (var i = 0; i < req.body.data.length; i++) {
    // 取得データ
    // 地域
    let district = datas[i].district;
    // 地域名
    let areaName = prefectures + municipality + district;
    // ワード
    let word = datas[i].word
    // データ
    let od = datas[i].value
    // 単位
    let unit = datas[i].unit
    // URL
    let url = datas[i].url
    
    // 地域登録プロミス
    promises.push(new Promise(function (resolve, reject) {
      console.log("--- area judgment promise start ---")

      if (prefectures == null) {
        // 都道府県がNULLの場合、処理しない。
        resolve("エラー。地域データが不足しています。")

      } else {
        // 地域検索
        let AREA_QUERY_PARAM = [prefectures, municipality, district]
        client.query(SELECT_AREA_QUERY, AREA_QUERY_PARAM).then((aqResult) => {
          if (aqResult.rows.length > 0 && aqResult.rows[0] != null) {
            // 地域が存在する場合は処理終了
            let message = "成功。地域は既に存在します。（エリアコード：" + aqResult.rows[0].area_code + ",都道府県：" + prefectures + ",市区町村：" + municipality + ",地域："  + district + "）";
            console.log(message)
            resolve(message)

          } else {
            // 地域登録
            client.query(INSERT_AREA_QUERY, AREA_QUERY_PARAM).then((result) => {
              // 登録成功したので処理終了
              let message = "成功。地域データを登録しました。（都道府県：" + prefectures + ",市区町村：" + municipality + ",地域："  + district + "）";
              console.log(message);
              resolve(message)

            }).catch((e) => {
              let message = "地域登録NG";
              console.log(message + " : " + e)
              // reject()
              resolve(message)
            })
          }

        }).catch((e) => {
          let message = "地域データ検索NG";
          console.log(message + " : " + e)
          // reject()
          resolve(message)
        })
      }
    }))

    // オープンデータ登録プロミス
    promises.push(new Promise(function (resolve, reject) {
      setTimeout( function () {
        console.log("--- open data judgment promise start ---")

        if (prefectures == null) {
          // 都道府県がNULLの場合、処理しない。
          resolve('エラー。地域データが不足しています。')

        } else {
          if (categoryName == null) {
            // カテゴリ名が存在しない場合は処理終了
            let message = "失敗。カテゴリ名が不足しています。";
            console.log(message)
            resolve(message)

          } else {
              // カテゴリコード取得（新規登録の場合があるため）
            client.query(SELECT_CATEGORY_QUERY, [categoryName]).then((cqResult) => {
              if (cqResult.rows.length == 0 || cqResult.rows[0] == null) {
                // カテゴリコード取得失敗時、処理終了
                let message = "エラー。データが不足しています。（カテゴリコード：,カテゴリ名：" + categoryName + "）";
                console.log(message)
                resolve(message)

              } else {
                // カテゴリコード
                categoryCode = cqResult.rows[0].category_code;

                // 地域コード取得
                let AREA_QUERY_PARAM = [prefectures, municipality, district]
                client.query(SELECT_AREA_QUERY, AREA_QUERY_PARAM).then((aqResult) => {
                  if (aqResult.rows.length == 0 || aqResult.rows[0] == null) {
                    // 地域コード取得失敗時、処理終了
                    let message = "エラー。データが不足しています。（エリアコード：,都道府県：" + prefectures + ",市区町村：" + municipality + ",地域："  + district + "）";
                    console.log(message)
                    resolve(message)

                  } else {
                    // 地域コード
                    let areaCode = aqResult.rows[0].area_code;

                    // オープンデータ検索
                    client.query(SELECT_OD_QUERY, [areaCode, categoryCode]).then((oqResult) => {
                      if (oqResult.rows.length > 0 && oqResult.rows[0] != null) {
                        // オープンデータが存在する場合は処理終了
                        let message = "成功。オープンデータは登録済みです。（カテゴリコード：" + categoryCode + ",カテゴリ名：" + categoryName + ",地域名：" + areaName + ",ワード：" + word + ",データ：" + od + ",単位：" + unit + ",URL：" + url + "）";
                        console.log(message)
                        resolve(message)

                      } else {
                        // オープンデータ登録
                        let INSERT_OD_QUERY_PARAM = [areaCode, categoryCode, word, od, unit, url];
                        client.query(INSERT_OD_QUERY, INSERT_OD_QUERY_PARAM).then((result) => {
                          // 登録成功したので処理終了
                          let message = "成功。オープンデータを登録しました。（カテゴリコード："+ categoryCode + ",カテゴリ名：" + categoryName + ",地域名：" + areaName + ",ワード：" + word + ",データ：" + od + ",単位：" + unit + ",URL：" + url + "）";
                          console.log(message);
                          resolve(message)

                        }).catch((e) => {
                          let message = "オープンデータ登録NG";
                          console.log(message + " : " + e)
                          // reject()
                          resolve(message)
                        })
                      }

                    }).catch((e) => {
                      let message = "オープンデータ検索NG";
                      console.log(message + " : " + e)
                      // reject()
                      resolve(message)
                    })
                  }

                }).catch((e) => {
                  let message = "地域コード取得NG";
                  console.log(message + " : " + e)
                  // reject()
                  resolve(message)
                })
              }

            }).catch((e) => {
              let message = "カテゴリコード取得NG";
              console.log(message + " : " + e)
              // reject()
              resolve(message)
            })
          }
        }
      }, 1000 ) ;
    }))
  }

  // プロミスを全て実行
  console.log("--- promises start ---")
  Promise.all(promises).then(function (results) {
    console.log("--- promises end success ---")
    console.log(results)
    // コネクション終了
    client.on('drain', client.end.bind(client));
    // resultsはpromiseの結果配列
    res.send(results);
  }).catch(function (reason) {
    console.log("--- promises end err ---")
    console.log(reason);
    // コネクション終了
    client.on('drain', client.end.bind(client));
  });
})

module.exports = router
