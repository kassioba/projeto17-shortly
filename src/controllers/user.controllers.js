import { db } from "../database/database.connection.js";
import { v4 as uuid } from 'uuid';


export async function userSignUp(req, res){
   const {email, name, password, confirmPassword} = req.body

   if(password !== confirmPassword) return res.sendStatus(422)
   
    try{
         const checkEmail = await db.query(
           `SELECT * FROM users WHERE email='${email}'`
         );

         if (checkEmail.rows[0]) return res.sendStatus(409);

        await db.query(`INSERT INTO "users" (email, name, password) VALUES ('${email}', '${name}', '${password}');`)

        res.sendStatus(201);
   } catch(err){
        res.status(500).send(err.message)
   }
}

export async function userSignIn(req, res){
    const {email, password} = req.body
    const token = uuid()

    try{
       const user = await db.query(
         `SELECT * FROM users WHERE "email"='${email}'`
       );

       if (!user.rows[0]) return res.sendStatus(401);

       if (user.rows[0].password !== password) return res.sendStatus(401);

       await db.query(
         `INSERT INTO sessions (token, "userId") VALUES ('${token}', '${user.rows[0].id}')`
       );

       res.send({token})
    }catch(err){
        res.status(500).send(err.message)
   }
}

export async function getMe(req, res) {
  const token = req.headers.authorization.replace("Bearer ", "");

  if (!token) return res.sendStatus(401);

  try {
    const userData = await db.query(`
      SELECT * FROM sessions
         JOIN users ON sessions."userId" = users.id
         JOIN urls ON sessions."userId" = urls."userId"
            WHERE token='${token}'
      `);

    if (!userData.rows[0]) return res.sendStatus(401);

    let userId;
    let userName;
    let totalVisitCount = 0;
    let shortenedUrls = [];

    userData.rows.forEach((row) => {
      userId = row.userId;
      userName = row.name;
      totalVisitCount += row.visitCount;

      shortenedUrls.push({
        id: row.id,
        shortUrl: row.shortUrl,
        url: row.url,
        visitCount: row.visitCount,
      });
    });

    res.send({
      id: userId,
      name: userName,
      visitCount: totalVisitCount,
      shortenedUrls,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function getRanking(req, res) {
  try {
    const ranking = await db.query(`
      SELECT users.id, name, "linksCount", SUM(COALESCE("visitCount", 0)) AS "visitCount" FROM users
	      LEFT JOIN urls ON users.id = urls."userId"
	      GROUP BY users.id, users.name, users."linksCount"
         ORDER BY SUM(COALESCE("visitCount", 0)) DESC
      `);

    const resFormat = [];

    ranking.rows.forEach((row) => {
      resFormat.push({
        id: row.id,
        name: row.name,
        linksCount: row.linksCount,
        visitCount: Number(row.visitCount),
      });
    });

    res.send(resFormat);
  } catch (err) {
    res.status(500).send(err.message);
  }
}