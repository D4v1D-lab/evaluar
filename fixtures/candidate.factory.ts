export type Candidate = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

const FIRST_NAMES = ['Ana', 'Luis', 'Maria', 'Carlos', 'Sofia', 'Diego'];
const LAST_NAMES = ['Gomez', 'Perez', 'Lopez', 'Martinez', 'Torres', 'Ramirez'];

export function buildCandidate(): Candidate {
  const uniqueDigits = Date.now().toString().slice(-8);
  const index = Number(uniqueDigits.slice(-4)) % FIRST_NAMES.length;
  const first = FIRST_NAMES[index];
  const last = LAST_NAMES[index];

  return {
    firstName: first,
    lastName: last,
    email: `${first}.${last}${uniqueDigits}@${first}${last}.com`.toLowerCase(),
    phoneNumber: `0979${uniqueDigits.slice(-6)}`,
  };
}
