let seed = 0;
function random() {
  seed += 10;
  const xseed = Math.sin(seed) * 1000000;
  return Math.abs((Math.floor(xseed)));
}

const suffle = (arr = [], shuffleQuestion = true) => {
  const ret = arr;
  if (!shuffleQuestion) return ret;
  for (let i = ret.length - 1; i > 0; i -= 1) {
    const j = (random()) % arr.length;
    [ret[i], ret[j]] = [arr[j], arr[i]];
  }
  return ret;
};

const getSuffledQuestionsWithOption = (arr) => {
  const qs = [];
  arr.forEach((q) => {
    qs.push({
      ...q,
      options: suffle(q.options),
    });
  });
  return qs;
};

const make = (init, questions, shuffleQuestion = true) => {
  seed = init;
  const qs = suffle(questions, shuffleQuestion);
  const final = getSuffledQuestionsWithOption(qs);
  return { seed, questions: final };
};

module.exports = { make };
