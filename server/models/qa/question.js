const { number } = require("joi");
const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").SchemaTypes;

const questionAsked = mongoose.Schema({
  studentId: {
    type: ObjectId,
    ref: "Student",
    required: true,
  },
  courseId: {
    type: ObjectId,
    ref: "Course",
    required: true,
  },
  subjectId: {
    type: ObjectId,
    ref: "Subject",
    required: true,
  },
  chapterId: {
    type: ObjectId,
    ref: "Chapter",
    required: false,
  },
  questionDescription: {
    type: String,
    required: true,
  },
  bookmarks: {
    type: Number,
    default: 0,
  },
  upvotes: {
    // this is the total number of upvotes in answers from mentors
    type: Number,
    default: 0,
  },
  byAdmin: {
    type: Boolean,
    default: false,
  },
  popularity: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  answers: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  lockable: {
    type: Boolean,
    default: true,
  },
  forwarded: {
    userId: {
      type: ObjectId,
      ref: "Admin",
      required: false,
    },
    forwardedAt: {
      type: Date,
      required: false,
    },
  },
  locked: {
    userId: {
      type: ObjectId,
      ref: "Admin",
      required: false,
    },
    lockedAt: {
      type: Date,
      required: false,
    },
  },
  status: {
    type: String,
    enum: ["COMPLETED", "COMPLETE", "DECLINE", "DECLINED"],
    default: "DECLINE",
  },
  statusUpdatedBy: {
    type: ObjectId,
    ref: "Admin",
    required: false,
  },
  media: [
    {
      mediaType: {
        type: String,
        required: false,
      },
      mediaUrl: {
        type: String,
        required: false,
      },
    },
  ],
});

const calculatePopularity = (upvotes, bookmarks, byAdmin) => {
  let popularity = upvotes + bookmarks * 2;
  if (byAdmin) {
    popularity += 100; // Boost for admin
  }
  console.log("popularity", popularity);
  return popularity;
};

questionAsked.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  // Initialize current values (in case they are not provided in the update)
  const docToUpdate = await this.model.findOne(this.getQuery());

  // Check if the document exists
  if (!docToUpdate) {
    return next(new Error("Document not found"));
  }

  // Get the current values from the document
  let upvotes = docToUpdate.upvotes ?? 0;
  let bookmarks = docToUpdate.bookmarks ?? 0;
  let byAdmin = docToUpdate.byAdmin ?? false;

  if (update.$inc) {
    if (update.$inc.upvotes !== undefined) {
      upvotes += update.$inc.upvotes;
    }
    if (update.$inc.bookmarks !== undefined) {
      console.log("update.$inc.bookmarks", update.$inc.bookmarks);
      bookmarks += update.$inc.bookmarks;
    }
  }
  update.$set = update.$set || {};
  update.$set.popularity = calculatePopularity(upvotes, bookmarks, byAdmin);

  next();
});

// Function to calculate popularity

module.exports = mongoose.model("QuestionAsked", questionAsked);
