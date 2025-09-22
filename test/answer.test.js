/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const chai = require('chai');

const { expect } = chai;
const { validateAnswer } = require('../server/lib/utils');

const testCase = [
  {
    actualAnswer: [1],
    studentAnswer: [1],
    expect: true,
  },
  {
    actualAnswer: [0],
    studentAnswer: [1],
    expect: false,
  },
  {
    actualAnswer: [1],
    studentAnswer: [0],
    expect: false,
  },
  {
    actualAnswer: [0, 1],
    studentAnswer: [1, 0],
    expect: true,
  },
  {
    actualAnswer: [0, 1],
    studentAnswer: [0],
    expect: false,
  },
  {
    actualAnswer: [0, 1],
    studentAnswer: [0, 1],
    expect: true,
  },
  {
    actualAnswer: [],
    studentAnswer: [],
    expect: true,
  },
  {
    actualAnswer: ['Dhaka'],
    studentAnswer: ['Dhaka'],
    expect: true,
  },
  {
    actualAnswer: ['Dhaka'],
    studentAnswer: ['Dhaka', 'Dhaka'],
    expect: false,
  },
  {
    actualAnswer: ['Dhaka', 'Jamalpur', 'Tangail'],
    studentAnswer: ['Jamalpur', 'Tangail', 'Dhaka'],
    expect: true,
  },
  {
    actualAnswer: ['1', '3', '2'],
    studentAnswer: ['2', '3', '1'],
    expect: true,
  },
  {
    actualAnswer: [3, 1, 2, 5],
    studentAnswer: [3, 5, 1, 2],
    expect: true,
  },
  {
    actualAnswer: [3, 1, 2, 5],
    studentAnswer: [3, 5, 1],
    expect: false,
  },
  {
    actualAnswer: [3, 1, 2],
    studentAnswer: [3, 5, 1, 2],
    expect: false,
  },
  {
    actualAnswer: [''],
    studentAnswer: ['Dhaka'],
    expect: false,
  },
  {
    actualAnswer: [''],
    studentAnswer: [''],
    expect: true,
  },
  {
    actualAnswer: [null],
    studentAnswer: [null],
    expect: true,
  },
  {
    actualAnswer: [false],
    studentAnswer: [null],
    expect: false,
  },
  {
    actualAnswer: [false],
    studentAnswer: [true],
    expect: false,
  },
  {
    actualAnswer: [true],
    studentAnswer: [true],
    expect: true,
  },
  {
    actualAnswer: [true],
    studentAnswer: [false],
    expect: false,
  },
  {
    actualAnswer: [false],
    studentAnswer: [false],
    expect: true,
  },
  {
    actualAnswer: ['দৃঢ় বস্তুর প্রকৃতির ওপর'],
    studentAnswer: ['দৃঢ় বস্তুর প্রকৃতির ওপর'],
    expect: true,
  },
];

describe('validateAnswer()', () => {
  testCase.forEach((tc) => {
    it(`([${tc.actualAnswer}], [${tc.studentAnswer}]) it should return ${tc.expect}`, () => {
      const isValid = validateAnswer(tc.actualAnswer, tc.studentAnswer);
      expect(isValid).to.be[tc.expect];
    });
  });
});
