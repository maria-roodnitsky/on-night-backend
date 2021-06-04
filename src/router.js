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

// You can send up to 300 emails/day from this sandbox server.
// Next, you should add your own domain so you can send 10000 emails/month for free.

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to our API!' });
});

const getUser = async (req, res) => {
  try {
    const user = await UserController.getUser(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ err });
  }
};

const updateUser = async (req, res) => {
  try {
    const userid = req.params.id;
    await UserController.updateUser(userid, req.body);
    res.json({ message: 'User has been updated!' });
  } catch (err) {
    res.status(500).json({ err });
  }
};

const getUsers = async (req, res) => {
  try {
    const allUsers = await UserController.getUsers();
    res.json(allUsers);
  } catch (err) {
    res.status(500).json({ err });
  }
};

const getEvents = async (req, res) => {
  try {
    const allEvents = await EventController.getEvents();
    res.json(allEvents);
  } catch (err) {
    res.status(500).json({ err });
  }
};

const getEvent = async (req, res) => {
  try {
    const event = await EventController.getEvent(req.params.id);
    res.json(event);
  } catch (err) {
    res.status(500).json({ err });
  }
};

const createEvent = async (req, res) => {
  try {
    const event = await EventController.createEvent(req.body);
    res.json(event);
  } catch (err) {
    res.status(500).json({ err });
  }
};

router.post('/signin', requireSignin, async (req, res) => {
  try {
    if (req.user.activated === false) {
      res.status(500).send({ errorMessage: 'Stop right there! Your account hasn\'t been activated yet. Check your inbox for an email from us, and click the link there to activate your account.' });
    } else {
      const token = UserController.signin(req.user);
      res.json({ token, email: req.user.email });
    }
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const token = await UserController.signup(req.body);
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

router.get('/activate', async (req, res) => {
  const { email, token } = req.query;
  try {
    await UserController.activateUser(email, token);
    res.json({ email, token, message: 'Successfully activated account!' });
  } catch (err) {
    res.status(500).json({ err, message: 'Unable to activate account!' });
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

router.post('/reset/sendemail', async (req, res) => {
  try {
    const userEmail = req.body.email;
    const { resetCode, userid } = await UserController.userIsResettingPassword(userEmail);

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

router.route('/users')
  .get(requireAuth, getUsers);

router.route('/users/:id')
  .get(requireAuth, getUser)
  .put(updateUser);

router.route('/events')
  .get(requireAuth, getEvents)
  .post(requireAuth, createEvent);

router.route('/events/:id')
  .get(requireAuth, getEvent);

export default router;
