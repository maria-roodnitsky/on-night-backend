import { Router } from 'express';
import dotenv from 'dotenv';
import * as EventController from './controllers/event_controller';
import * as UserController from './controllers/user_controller';
import { requireAuth, requireSignin } from './services/passport';

dotenv.config({ silent: true });

const router = Router();

// Configuring Mailgun constants
const mailgun = require('mailgun-js');

const DOMAIN = 'onnight.me';
const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: DOMAIN,
});

// Home route
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to our API!' });
});

// Get user by ID
const getUser = async (req, res) => {
  try {
    const user = await UserController.getUser(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ err });
  }
};

// Update user by ID and new fields
const updateUser = async (req, res) => {
  try {
    const userid = req.params.id;
    await UserController.updateUser(userid, req.body);
    res.json({ message: 'User has been updated!' });
  } catch (err) {
    res.status(500).json({ err });
  }
};

// Delete user by ID
const deleteUser = async (req, res) => {
  try {
    const userid = req.params.id;
    await UserController.deleteUser(userid);
    res.json({ message: 'User has been deleted!' });
  } catch (err) {
    res.status(500).json({ err });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const allUsers = await UserController.getUsers();
    res.json(allUsers);
  } catch (err) {
    res.status(500).json({ err });
  }
};

// Get all events
const getEvents = async (req, res) => {
  try {
    const allEvents = await EventController.getEvents();
    res.json(allEvents);
  } catch (err) {
    res.status(500).json({ err });
  }
};

// Get event by ID
const getEvent = async (req, res) => {
  try {
    const event = await EventController.getEvent(req.params.id);
    res.json(event);
  } catch (err) {
    res.status(500).json({ err });
  }
};

// Create new event with postFields
const createEvent = async (req, res) => {
  try {
    const event = await EventController.createEvent(req.body);
    res.json(event);
  } catch (err) {
    res.status(500).json({ err });
  }
};

// Delete event by ID
const deleteEvent = async (req, res) => {
  try {
    const eventid = req.params.id;
    await EventController.deleteEvent(eventid);
    res.json({ message: 'Event has been deleted!' });
  } catch (err) {
    res.status(500).json({ err });
  }
};

// Update event with ID and putFields
const updateEvent = async (req, res) => {
  try {
    const eventid = req.params.id;
    await EventController.updateEvent(eventid, req.body);
    res.json({ message: 'Event has been updated!' });
  } catch (err) {
    res.status(500).json({ err });
  }
};

// Route to sign in a user
router.post('/signin', requireSignin, async (req, res) => {
  try {
    // Raise error if user's account hasn't been activated yet
    if (req.user.activated === false) {
      res.status(500).send({ errorMessage: 'Stop right there! Your account hasn\'t been activated yet. Check your inbox for an email from us, and click the link there to activate your account.' });
    } else {
      // Otherwise, return a JWT
      const token = UserController.signin(req.user);
      res.json({ token, email: req.user.email });
    }
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

// Route to create a new user
router.post('/signup', async (req, res) => {
  try {
    const token = await UserController.signup(req.body);

    // Send an activation email with Mailgun
    const url = `http://${req.header('Host')}/api/activate?email=${req.body.email}&token=${token}`;

    const data = {
      from: 'OnNight Team <noreply@onnight.me>',
      to: `${req.body.email}`,
      subject: 'Please activate your OnNight Account',
      text: `Hey there, and welcome to OnNight!\n\nTo activate your account and see what is happening around Dartmouth, click the following URL:\n\n${url}\n\n Thanks!\n-The OnNight Team`,
    };

    mg.messages().send(data);

    res.json({ message: 'Sent activation email!', token, email: req.body.email });
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

// Activate an account with given email/token query values
router.get('/activate', async (req, res) => {
  const { email, token } = req.query;
  try {
    await UserController.activateUser(email, token);
    res.json({ email, token, message: 'Successfully activated account!' });
  } catch (err) {
    res.status(500).json({ err, message: 'Unable to activate account!' });
  }
});

// Check if a user's account is activated with user's email
router.post('/activate', async (req, res) => {
  const userEmail = req.body.email;
  try {
    const user = await UserController.getUserByEmail(userEmail);
    const { activated } = user;
    res.json({ activated });
  } catch (err) {
    res.status(500).json({ err });
  }
});

// Verify user identity before being allowed to enter new password
router.post('/users/info', async (req, res) => {
  const userEmail = req.body.email;
  try {
    const user = await UserController.getUserByEmail(userEmail); 
    res.json({ user });
  } catch (err) {
    res.status(500).json({ err }); 
  }
}); 

router.get('/reset', async (req, res) => {
  const { email, resetCode } = req.query;
  try {
    const { resettingPassword, userid } = await UserController.checkPasswordResetCode(email, resetCode);
    if (resettingPassword === true) {
      res.json({
        message: 'Success! Visit the app, where you should be prompted to enter in your new password.', email, userid, resettingPassword,
      });
    } else {
      res.json({ message: 'Failed! Start password reset process from beginning.' });
    }
  } catch (err) {
    res.status(500).json({ err, message: 'Unable to set resettingPassword to true! Try again.' });
  }
});

// Send a password-reset user verification email to the user's inbox
router.post('/reset/sendemail', async (req, res) => {
  try {
    const userEmail = req.body.email;
    const { resetCode, userid } = await UserController.userIsResettingPassword(userEmail);

    // Send email using Mailgun
    const url = `http://${req.header('Host')}/api/reset?email=${req.body.email}&resetCode=${resetCode}`;

    const data = {
      from: 'OnNight Team <noreply@onnight.me>',
      to: `${userEmail}`,
      subject: 'Resetting your OnNight Password',
      text: `Hey there!\n\nTo reset your password, click the following link and go back to the app. From there, you'll be prompted to enter your new password:\n\n${url}\n\n Thanks!\n-The OnNight Team`,
    };

    mg.messages().send(data);

    res.json({
      message: 'Sent password reset email!', resetCode, email: userEmail, userid,
    });
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

// Router configurations
router.route('/users')
  .get(requireAuth, getUsers);

router.route('/users/:id')
  .get(requireAuth, getUser)
  .put(updateUser)
  .delete(deleteUser);

router.route('/events')
  .get(requireAuth, getEvents)
  .post(requireAuth, createEvent);

router.route('/events/:id')
  .get(requireAuth, getEvent)
  .put(updateEvent)
  .delete(deleteEvent);

export default router;
