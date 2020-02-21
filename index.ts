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

type Location = {
  email: string;
  rating: string;
  title: string;
  amount: number;
};

type MappedDataset = {
  key: string;
  values: any[];
}[];

type MappedDatasetArray = MappedDataset[];

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

const mapRentsAmountByClients = (
  dataset: Location[],
): {
  email: string;
  rentsAmounts: number[];
}[] =>
  dataset
    .map((rent: Location) => [rent.email, [rent.amount]])
    .reduce((acc, cur) => {
      const existIndex = acc.findIndex(r => r[0] === cur[0]);
      if (existIndex === -1) return [...acc, cur];
      acc[existIndex][1].push(...cur[1]);
      return acc;
    }, []);

//console.log(splitDataset(DATASET, 2).map(mapRentsAmountByClients));

const sortAndShuffle = (mappedDatasets: MappedDatasetArray) => {};
