import { Router } from 'express';
import * as EventController from './controllers/event_controller';
import * as UserController from './controllers/user_controller';
import { requireAuth, requireSignin } from './services/passport';

const router = Router();

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
    const token = UserController.signin(req.user);
    res.json({ token, email: req.user.email });
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const token = await UserController.signup(req.body);
    res.json({ token, email: req.body.email });
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

router.route('/users')
  .get(requireAuth, getUsers);
// .post(signup);

router.route('/users/:id')
  .get(requireAuth, getUser);

router.route('/events')
  .get(requireAuth, getEvents)
  .post(requireAuth, createEvent);

router.route('/events/:id')
  .get(requireAuth, getEvent);

export default router;
