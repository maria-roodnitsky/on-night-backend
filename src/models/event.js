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

  // title: String,
  // description: String,
  // house: String,
  // location: String,
  // public: Boolean,
  // calendar: {
  //   day: Number,
  //   month: Number,
  //   year: Number,
  //   timestamp: String,
  //   dateString: String,
  // },

  // {
  //     day: 1,      // day of month (1-31)
  //     month: 1,    // month of year (1-12)
  //     year: 2017,  // year
  //     timestamp,   // UTC timestamp representing 00:00 AM of this date
  //     dateString: '2016-05-13' // date formatted as 'YYYY-MM-DD' string
  //   }

}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

// create model class
const EventModel = mongoose.model('Event', EventSchema);

export default EventModel;
