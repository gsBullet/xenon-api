module.exports = {
  GET_SESSION: () => new Date().getFullYear() - 1,
  NEGATIVE_NUMBER: -999999,
  VERSION: "v0.2.4",
  socket: {
    events: {
      NOTIFICATION: "notification",
      MESSAGE: "message",
      CSV_GENERATED: "CSVGenerated",
    },
  },
  notification: {
    type: {
      NOTIFICATION: "notification",
      MESSAGE: "message",
      NOTICE: "notice",
    },
    action: {
      CREATED: "created",
      ADDED: "added",
      REMOVED: "removed",
      PUBLISHED: "published",
      COMMENT: "comment",
    },
  },
  question: {
    type: {
      SHORT_ANS: "shortAns",
      PARAGRAPH: "paragraph",
      MCQ: "MCQ",
      CHECKBOX: "checkbox",
      MCA: "MCA",
    },
    status: {
      PENDING: "pending",
      APPROVED: "approved",
      REJECTED: "rejected",
    },
  },
  exam: {
    status: {
      SCHEDULED: "scheduled",
      UNPUBLISHED: "unpublished",
      PUBLISHED: "published",
      CREATED: "created",
      ENDED: "ended",
      REVIEWED: "reviewed",
      REJECTED: "rejected",
      APPROVED: "approved",
      PENDING: "pending",
      RESULT_PUBLISHED: "resultPublished",
    },
    type: {
      PRACTICE: "practice",
      LIVE: "live",
    },
  },
  content: {
    types: {
      VIDEO: "video",
      FILE: "file",
    },
  },
  errors: {
    INCORRECT: "incorrect",
    EXPIRED: "expired",
    NOT_FOUND: "notFound",
    NOT_ACTIVE: "notActive",
    NOT_VERIFIED: "notVerified",
    INCORRECT_PASSWORD: "incorrectPassword",
    PASSWORD_NOT_SET: "passwordNotSet",
    NOT_UPDATE_ABLE: "notUpdateAble",
  },
  sensitivityLevel: {
    SERVER: "server",
    ADMIN: "admin",
    APP_USER: "appUser",
    PUBLIC: "public",
  },
  student: {
    status: {
      PENDING: "pending",
      ACTIVE: "active",
      DEACTIVE: "deactive",
      BANNED: "banned",
    },
    roles: {
      STUDENT: "student",
    },
  },
  admin: {
    status: {
      PENDING: "pending",
      ACTIVE: "active",
      DEACTIVE: "deactive",
      BANNED: "banned",
    },
    roles: {
      ADMIN: "admin",
      MODERATOR: "moderator",
      EXAM_MODERATOR: "examModerator",
      EXAMINER: "examiner",
      QUESTION_UPLOADER: "MQCUploader",
      CONTENT_UPLOADER: "lectureNoteUploader",
      INSTRUCTOR: "examViewer",
      MENTOR: "mentor",
      SENIOR_MENTOR: "seniorMentor",
    },
  },
  queue: {
    AGGREGATE: "aggregate",
    EMAIL_QUEUE: "email_queue",
  },
  CSV: {
    category: {
      MERIT_LIST: "meritList",
    },
  },
  smsGateway: {
    REVE: "reve",
    INFOBIP: "infobip",
    METRO: "metro",
  },
  channel: {
    START_PROCESS: "startProcess",
  },
  resultStatusInRedis: {
    PROCESSING: "processing",
    PROCESSED: "processed",
    NOT_PROCESSED_YET: "notProcessed",
  },
  topic: {
    CHECK_MESSAGE: "checkMessage",
  },
};
