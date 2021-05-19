/* eslint linebreak-style: ["error", "windows"] */
import mongoose, { Schema } from 'mongoose';

const EventSchema = new Schema({
  title: String,
  description: String,
  year: Number,
  month: Number,
  day: Number,
  time: String,
  location: String,
  public: Boolean,
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

// create model class
const EventModel = mongoose.model('Event', EventSchema);

export default EventModel;
