import { Router } from 'express';
import dotenv from 'dotenv';
import * as EventController from './controllers/event_controller';
import * as UserController from './controllers/user_controller';
import { requireAuth, requireSignin } from './services/passport';

dotenv.config({ silent: true });

const router = Router();

// Configuring Mailgun constants
const mailgun = require('mailgun-js');

const DOMAIN = 'sandbox2a37ccde144a45d284e634688c5369a0.mailgun.org';
const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: DOMAIN,
});

// You can send up to 300 emails/day from this sandbox server.
// Next, you should add your own domain so you can send 10000 emails/month for free.

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to our API!' });
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

const getUser = async (req, res) => {
  try {
    const user = await UserController.getUser(req.params.id);
    res.json(user);
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
      from: 'OnNight Team <postmaster@sandbox2a37ccde144a45d284e634688c5369a0.mailgun.org>',
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

router.route('/users')
  .get(requireAuth, getUsers);

router.route('/users/:id')
  .get(requireAuth, getUser);

router.route('/events')
  .get(requireAuth, getEvents)
  .post(requireAuth, createEvent);

router.route('/events/:id')
  .get(requireAuth, getEvent);

export default router;
