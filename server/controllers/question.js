const constants = require("../constants");
const dao = require("../data");
const { generateQuestion } = require("../lib/csvGenerator");

module.exports = {
  create: async (req, res) => {
    try {
      const data = req.body.questions.map((q) => ({
        ...q,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: req.user.id,
      }));

      // reverse the array to insert the latest question first
      //data.reverse();

      const question = await dao.question.create(data);
      res.ok(question);
    } catch (err) {
      res.serverError(err);
    }
  },
  getById: async (req, res) => {
    try {
      const question = await dao.question.getById(req.params.id);
      res.ok(question);
    } catch (err) {
      if (err.message === constants.errors.NOT_FOUND) {
        res.notFound({ title: "Question not found" });
        return;
      }
      res.serverError(err);
    }
  },
  exportCSV: async (req, res) => {
    try {
      const { courseId, subjectId, lectureId, chapterId, title, lastId } =
        req.query;
      const questions = await dao.question.search({
        courseId,
        subjectId,
        lectureId,
        chapterId,
        title,
        lastId,
        all: true,
      });
      const ret = await generateQuestion(questions);
      res.ok(ret);
    } catch (err) {
      res.serverError(err);
    }
  },
  search: async (req, res) => {
    try {
      const {
        courseId,
        subjectId,
        lectureId,
        chapterId,
        title,
        lastId,
        questionSolveId,
      } = req.query;
      const questions = await dao.question.search({
        courseId,
        subjectId,
        lectureId,
        chapterId,
        title,
        lastId,
        questionSolveId,
      });
      res.ok(questions);
    } catch (err) {
      res.serverError(err);
    }
  },
  updateById: async (req, res) => {
    try {
      const question = await dao.question.updateById(req.params.id, req.body);
      res.ok(question);
    } catch (err) {
      if (err.message === constants.errors.NOT_FOUND) {
        res.notFound({ title: "No question found to update" });
        return;
      }
      res.serverError(err);
    }
  },
  removeById: async (req, res) => {
    try {
      const question = await dao.question.updateById(req.params.id, {
        isDeleted: true,
      });
      res.ok(question);
    } catch (err) {
      if (err.message === constants.errors.NOT_FOUND) {
        res.notFound({ title: "No question found to delete" });
        return;
      }
      res.serverError(err);
    }
  },
};
