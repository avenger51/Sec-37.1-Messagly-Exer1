
const Router = new express.Router();
const User = require("../models/user");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");

const router = new Router();

//don't need authenticateJWT?  
router.get('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const allUsers = await User.all();
        return res.json(allUsers);
    } catch (e) {
        return next(e);
    }
});      

//don't need authenticateJWT, ensureLoggedIn ??  I thinl to get to ensureCorrectUser have to go through them first.
router.get('/:username', async (req, res, next) => {
    try {
        //const requestedUsername = req.params.username;
        //const authenticatedUsername = req.user.username;

        //if(requestedUsername !== authenticatedUsername) {
        //    return res.status(403).json({ message: "Unauthorized Access" });
        //}
        const user = await User.get(req.params.username);
        return res.json({user});
    } catch (e) {
        return next(e);
    }
});
/** GET /:username/to - get messages to user
 => {messages: [{id, body, sent_at, read_at, from_user: {username, first_name, last_name, phone}}, ...]} **/

router.get('/:username/to', authenticateJWT, ensureLoggedIn, async (req, res, next) => {
    try {
        const username = req.params.username;
        const userTo = await User.messagesTo(username);
        return res.json(userTo);
    } catch (e) {
        return next(e);
    }
    });

/** GET /:username/from - get messages from user
 => {messages: [{id,body,sent_at,read_at, to_user: {username, first_name, last_name, phone}}, ...]} **/

router.get('/:username/from', authenticateJWT, ensureLoggedIn, async (req, res, next) => {
  try {
      const username = req.params.username;
      const userFrom = await User.messagesFrom(username);
      return res.json(userFrom);
  } catch (e) {
      return next(e);
  }
  });
                
module.exports = router;
