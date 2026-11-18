export type Candidate = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

export function buildCandidate(): Candidate {
  const uniqueDigits = Date.now().toString().slice(-8);
  const uniqueLetters = uniqueDigits.replace(/\d/g, (d) => 'abcdefghij'[Number(d)]);

  return {
    firstName: `abc${uniqueLetters}`,
    lastName: `abc${uniqueLetters}`,
    email: `abc+${uniqueDigits}@abc.com`,
    phoneNumber: `0979${uniqueDigits.slice(-6)}`,
  };
}
