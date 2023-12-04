/** User class for message.ly */
const { BCRYPT_WORK_FACTOR } = require("../config");
const db = require("../db");
const ExpressError = require("../expressError");
const bcrypt = require('bcrypt');

class User {

  /** register new user -- returns  {username, password, first_name, last_name, phone} */

static async register({username, password, first_name, last_name, phone}) { 
  let hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
        `INSERT INTO users(
              username,
              password,
              first_name,
              last_name,
              phone, 
              join_at
              )
            VALUES ($1, $2, $3, $4, $5, current_timestamp)
            RETURNING username, password, first_name, last_name, phone, join_at`,
        [username, hashedPassword, first_name, last_name, phone]);

    return result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */
static async authenticate(username, password) {
    // Query the database for the user
    const result = await db.query(
      `SELECT username, password
       FROM users
       WHERE username = $1, password = $2`
      [username, password]
    );

    const user = result.rows[0];

    if (user) {
      // Compare provided password with stored password
      const isValid = await bcrypt.compare(password, user.password);
      return isValid;
    }

    return false;  //NOTE: SO JUST END IT HERE OR ERROR??
  }

  /** Update last_login_at for user */

static async updateLoginTimestamp(username) { 
    const result = await db.query(
      `UPDATE users
      SET last_login_at = current_timestamp
      WHERE username = $1
      RETURNING username, last_login_at`, [username]
    );
  
    if (!result.rows[0]) {
      throw new ExpressError(`No such user??: ${username}`, 404);  //NO IDEA
    }
    const loginTime = result.rows[0];
    return loginTime;
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    const result = db.query(
      `SELECT username,
              first_name,
              last_name, 
              phone,
              join_at,
              last_login_at
              FROM users`
              //WHERE username = $1, first_name = $2, last_name = $3, phone = $4, join_at = $5, last_login_at = %6`,
              //[username, first_name, last_name, phone, join_at, last_login_at]
    );
           
    let allUsers = result.rows[0];
    return allUsers;
  }
  /** Get: get user by username
  returns {username, first_name, last_name, phone, join_at, last_login_at } */

  static async get(username) { 
    const result = db.query(
      `SELECT username
       FROM users
       WHERE username = $1`, [username]
    );
    if (!result.rows[0]) {
      throw new ExpressError(`No such user??: ${username}`, 404);  
    }
  let getUser = result.rows[0];
  return getUser;
  }


/** Return messages from this user.
   [{id, to_user, body, sent_at, read_at}] where to_user is  HUH? {username, first_name, last_name, phone} */

  static async messagesFrom(username) { 
    const result = await db.query(
          `SELECT m.*
           FROM messages m
           WHERE m.from_username = $1`,
          [username]
      );

      if (!result.rows[0]) {
        throw new ExpressError(`No such user??: ${username}`, 404);  //NO IDEA
      }
      let messageFrom = result.rows[0];
      return messageFrom;
  }
  /** Return messages to this user.
   [{id, from_user, body, sent_at, read_at}]
    where from_user is {username, first_name, last_name, phone}*/

  static async messagesTo(username) { 
    const result = await db.query(
      `SELECT m.*
       FROM messages m
       WHERE m.to_username = $1`,
      [username]
  );

  if (!result.rows[0]) {
    throw new ExpressError(`No such user??: ${username}`, 404);  //NO IDEA
  }
  let messageTo = result.rows[0];
  return messageTo;
}

}


module.exports = User;