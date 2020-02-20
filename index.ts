// -----
// utils
// -----

const log = (...args: any[]) => console.log(`=> ${args}`);

const tapLog = (x: any) => {
  log(x);
  return x;
};

// -----
// main
// -----

const splitDataset = (dataset: any[], nb: number) => {
  const split = [];
  const sliceSize: number = Math.floor(dataset.length / nb);

  for (let i = 0; i < nb; i++) {
    split.push(
      dataset.slice(
        i * sliceSize,
        i === nb - 1 ? undefined : (i + 1) * sliceSize,
      ),
    );
  }

  return split;
};

// -----
// example: average of nb of vowels by length of word
// -----

type Location = {
  email: string;
  rating: string;
  title: string;
  amount: number;
};

const DATASET: Location[] = [
  { email: 'john.doe@email.com', rating: 'G', title: 'TITANIC', amount: 2.5 },
  { email: 'john.doe@email.com', rating: 'R', title: 'ROCKY 1', amount: 3.5 },
  { email: 'john.doe@email.com', rating: 'R', title: 'ROCKY 2', amount: 5.0 },
  {
    email: 'jane.doe@email.com',
    rating: 'NC-17',
    title: 'ROCKY 3',
    amount: 1.33,
  },
  {
    email: 'jane.doe@email.com',
    rating: 'PG-13',
    title: 'TITANIC',
    amount: 2.7,
  },
  { email: 'jane.doe@email.com', rating: 'G', title: 'FREDDY', amount: 7.1 },
  {
    email: 'jane.doe@email.com',
    rating: 'R',
    title: 'HARRY POTTER 1',
    amount: 3.5,
  },
  {
    email: 'tito.doe@email.com',
    rating: 'PG',
    title: 'HARRY POTTER 2',
    amount: 0.5,
  },
  { email: 'tito.doe@email.com', rating: 'PG-13', title: 'TITANIC', amount: 2 },
  { email: 'tito.doe@email.com', rating: 'G', title: 'ROCKY 1', amount: 2.9 },
];

const mapRentsByClients = (dataset: Location[]) =>
  dataset
    .map((rent: Location) => [rent.email, rent.amount])
    .reduce((acc, cur) => {
      const existIndex = acc.findIndex(r => r[0] === cur[0]);
      return existIndex === -1 ? [...acc, ] 
    }, []);

console.log(mapRentsByClients(DATASET));

/* // map, regroup and sort
const mapNbOfVowelsByLengthOfWord = (wordArray: string[]) =>
  wordArray
    .reduce((computed, word) => {
      const existingIndex = computed.findIndex(c => c[0] === word.length);

      return existingIndex === -1
        ? [...computed, [word.length, countVowels(word)]]
        : computed.map((c, i) =>
            i === existingIndex ? [...c, countVowels(word)] : c,
          );
    }, [])
    .sort(sortByFirstIndex);

console.log(mapNbOfVowelsByLengthOfWord(DATASET));

// reduce
const reduceAvgNbOfVowelsByLengthOfWord = (mappedWords: number[][]) => {}; */
