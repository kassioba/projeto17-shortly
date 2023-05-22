import { db } from "../database/database.connection.js"
import { nanoid } from 'nanoid'

export async function shortenUrl(req, res) {
  const url = req.body.url;
  const token = req.headers.authorization.replace("Bearer ", "");

  if (!token) return res.sendStatus(401);

  try {
    const user = await db.query(
      `SELECT "userId" FROM sessions WHERE "token"='${token}'`
    );

    if (!user.rows[0]) return res.sendStatus(401);

    await db.query(
      `INSERT INTO urls ("userId", url, "shortUrl") VALUES ('${
        user.rows[0].userId
      }', '${url}', '${nanoid()}')`
    );

    const shortUrl = await db.query(
      `SELECT id, "shortUrl" FROM urls WHERE url='${url}'`
    );

    const userData = await db.query(
      `SELECT "linksCount" FROM users WHERE id='${user.rows[0].userId}'`
    );

    await db.query(
      `UPDATE users SET "linksCount"='${
        userData.rows[0].linksCount + 1
      }' WHERE id='${user.rows[0].userId}'`
    );

    res.status(201).send({
      id: shortUrl.rows[shortUrl.rows.length - 1].id,
      shortUrl: shortUrl.rows[shortUrl.rows.length - 1].shortUrl,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function getUrl(req, res) {
  const urlId = req.params.id;

  try {
    const findUrl = await db.query(
      `SELECT id, "shortUrl", url FROM urls WHERE id=$1`,
      [urlId]
    );

    if (!findUrl.rows[0]) return res.sendStatus(404);

    res.send({
      id: findUrl.rows[0].id,
      shortUrl: findUrl.rows[0].shortUrl,
      url: findUrl.rows[0].url,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function redirectToShortUrl(req, res) {
  const shortUrl = req.params.shortUrl;

  try {
    const findShortUrl = await db.query(
      `SELECT url, "visitCount" FROM urls WHERE "shortUrl"=$1`,
      [shortUrl]
    );

    if (!findShortUrl.rows[0]) return res.sendStatus(404);

    await db.query(
      `UPDATE urls SET "visitCount"='${
        findShortUrl.rows[0].visitCount + 1
      }' WHERE "shortUrl"=$1`,
      [shortUrl]
    );

    res.redirect(findShortUrl.rows[0].url);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function deleteUrl(req, res) {
  const urlId = req.params.id;
  const token = req.headers.authorization.replace("Bearer ", "");

  if (!token) return res.sendStatus(401);

  try {
    const findToken = await db.query(
      `SELECT * FROM sessions WHERE token='${token}'`
    );

    if (!findToken.rows[0]) return res.sendStatus(401);

    const urlUserId = await db.query(`SELECT "userId" FROM urls WHERE id=$1`, [
      urlId,
    ]);

    if (!urlUserId.rows[0]) return res.sendStatus(404);

    if (findToken.rows[0].userId !== urlUserId.rows[0].userId)
      return res.sendStatus(401);

    await db.query(`DELETE FROM urls WHERE id=$1`, [urlId]);

    res.sendStatus(204);
  } catch (err) {
    res.status(500).send(err.message);
  }
}