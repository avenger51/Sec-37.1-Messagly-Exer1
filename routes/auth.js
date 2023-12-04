const jwt = require("jsonwebtoken");
const Router = new express.Router();
const router = new Router();
const User = require('../models/user');
const { SECRET_KEY } = require("../config");
const ExpressError = require("../expressError"); 



/** POST /login - login: {username, password} => {token}
 Make sure to update their last-login!**/

router.post('/login', async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const user = await User.authenticate(username, password);
  
      if (user) {
        await User.updateLoginTimestamp(username); // Update last-login timestamp
        const token = jwt.sign({ username }, SECRET_KEY); // Adjust SECRET_KEY as needed
        return res.json({ token });
      } else {
        return res.status(400).json({ message: "Invalid username/password" });
      }
    } catch (err) {
      return next(err);
    }
  });

/** POST /register - register user: registers, logs in, and returns token.
 {username, password, first_name, last_name, phone} => {token}.
 Make sure to update their last-login!  -NOTE:  DOESN'T THE User.register do that?? leaving out for now
 */

router.post('/register', async (req, res, next) => {
    try {
        let { username } = await User.register(req.body);
        let token = jwt.sign({ username }, SECRET_KEY);
        user.updateLoginTimestamp(username);
        return res.json({ token });
    }
    catch (err) {
      return next(err);
    }
  });
  //seems incorrect....
    //const { username, password, first_name, last_name, phone } = req.body; 
    //if (!username || !password || !first_name || !last_name || !phone) {
    //    throw new ExpressError("Please provide all needed input", 400);
    //}
    //const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    //const newuserReg = await User.register({username, hashedPassword, first_name, last_name, phone});;
    //
    //return res.json(newuserReg);
    //    
    //} catch (e) {
    //    if (e.code === '23505') {
    //      return next(new ExpressError("Username taken. Please pick another!", 400));
    //    }
    //    return next(e)
    //  }
    //});


  module.exports = router;

