/* eslint-disable import/prefer-default-export */
/* eslint linebreak-style: ["error", "windows"] */
import Event from '../models/event';

export const getEvents = async () => {
  const events = await Event.find();

  try {
    return events;
  } catch (error) {
    throw new Error(`get all events error: ${error}`);
  }
};
