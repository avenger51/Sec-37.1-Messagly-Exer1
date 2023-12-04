const express = require('express');
const router = express.Router();
const Messages = require('./models/message'); 
const ExpressError = require('../expressError');
//router.use(jwt({ secret: 'your_jwt_secret', algorithms: ['HS256'] }));

/** GET /:id - get detail of message.=> {message: {id,body,sent_at,read_at,from_user: {username, first_name, last_name, phone},to_user: {username, first_name, last_name, phone}}
Make sure that the currently-logged-in users is either the to or from user.*/

router.get('/messages/:id', authenticateJWT, ensureLoggedIn, ensureCorrectUser, async (req, res, next) => {
     try {
         const messageId = req.params.id;
         const userId = req.user.id; 

         const isUserAssociated = await Messages.verifyUserAssociation(messageId, userId);
         if (!isUserAssociated) {
             return res.status(403).json({ error: 'User not associated with this message' });
         }
 
         const message = await modelMessages.get(messageId);
         res.json(message);
     } catch (error) {
         res.status(error.status || 500).json({ error: error.message });
     }
 });

/** POST / - post message. {to_username, body} =>   {message: {id, from_username, to_username, body, sent_at}}**/

router.post('/messages', async (req, res, next) => {
    try {
        const { to_username, body } = req.body;
        const from_username = req.user.username;
        
        if(!to_username || !body || !from_username) {
            throw new ExpressError("missing to user or body", 400);
        }
       
        const addMessage = await Messages.create({from_username, to_username, body });
        
        return res.json(addMessage);
            } catch (e) {
                return next(e);
            }
        });      
        

/** POST/:id/read - mark message as read:  => {message: {id, read_at}} 
 * Make sure that the only the intended recipient can mark as read.**/
router.post('/:id/read', async (req, res, next) => {
    try {
        const messageId = req.params.id;
        
        //if(!messageId) {
        //    throw new ExpressError("Message not found?", 400);
        //}
       
        const markMessageRead = await Messages.markRead(messageId);
        //if (!markMessageRead) {
        //    return res.status(403).json({ error: 'Message not found?????' });
        //}
        return res.json(markMessageRead);
            } catch (e) {
                return next(e);
            }
        });      

module.exports = router;