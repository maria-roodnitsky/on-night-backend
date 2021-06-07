/* eslint-disable import/prefer-default-export */
import Event from '../models/event';

export const createEvent = async (postFields) => {
  const event = new Event();
  event.title = postFields.title;
  event.description = postFields.description;
  event.year = postFields.year;
  event.month = postFields.month;
  event.day = postFields.day;
  event.time = postFields.time;
  event.location = postFields.location;
  event.public = postFields.public;

  try {
    const savedEvent = await event.save();
    return savedEvent;
  } catch (error) {
    throw new Error(`create event error: ${error}`);
  }
};

export const getEvent = async (id) => {
  const event = await Event.findById(id);

  try {
    return event;
  } catch (error) {
    throw new Error(`could not get event error: ${error}`);
  }
};

export const deleteEvent = async (id) => {
  try {
    await Event.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(`could not delete event: ${error}`);
  }
};

export const getEvents = async () => {
  const events = await Event.find();

  try {
    return events;
  } catch (error) {
    throw new Error(`get all events error: ${error}`);
  }
};
