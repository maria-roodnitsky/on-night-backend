import { Router } from 'express';
import * as EventController from './controllers/event_controller';
import * as UserController from './controllers/user_controller';

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

const createUser = async (req, res) => {
  try {
    const user = await UserController.createUser(req.body);
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

router.route('/users')
  .get(getUsers)
  .post(createUser);

router.route('/users/:id')
  .get(getUser);

router.route('/events')
  .get(getEvents)
  .post(createEvent);

router.route('/events/:id')
  .get(getEvent);

export default router;
