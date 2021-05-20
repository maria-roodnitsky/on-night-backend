import { Router } from 'express';
import * as EventController from './controllers/event_controller';
import * as UserController from './controllers/user_controller';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to our API!' });
});

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

router.route('/users')
  .get(getUsers);

router.route('/events')
  .get(getEvents);

export default router;
