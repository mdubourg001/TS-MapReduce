// -----
// types
// -----

/** Le type de données récupérées depuis le CSV */
type Location = {
  email: string;
  rating: string;
  title: string;
  amount: number;
};

type Pair = any[2];

type MappedDataset = Pair[];

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

/** Découpe un dataset en `nb` datasets plus petits */
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
// maps
// N.B: Les maps sont notées 'async' afin de pouvoir être parallélisées à l'aide de 'Promise.all'
// -----

/** Retourne un tableau de 'Pair' <email, amount[]>   */
const mapRentsAmountByClients = async (dataset: Location[]): MappedDataset =>
  dataset
    .map((rent: Location) => [rent.email, [rent.amount]])
    .reduce((acc, cur) => {
      const existIndex = acc.findIndex(r => r[0] === cur[0]);
      if (existIndex === -1) return [...acc, cur];
      acc[existIndex][1].push(...cur[1]);
      return acc;
    }, []);

/** Retourne un tableau de 'Pair' <email, amount[]>   */
const mapRentsAmountByRating = async (dataset: Location[]): MappedDataset =>
  dataset
    .map((rent: Location) => [rent.rating, [rent.amount]])
    .reduce((acc, cur) => {
      const existIndex = acc.findIndex(a => a[0] === cur[0]);
      if (existIndex === -1) return [...acc, cur];
      acc[existIndex][1].push(...cur[1]);
      return acc;
    }, []);

const mapMostRentedByRating = async (dataset: Location[]): MappedDataset =>
  dataset
    .map((rent: Location) => [rent.rating, [rent.title]])
    .reduce((acc, cur) => {
      const existIndex = acc.findIndex(a => a[0] === cur[0]);
      if (existIndex === -1) return [...acc, cur];
      acc[existIndex][1].push(...cur[1]);
      return acc;
    }, []);

/** Rassemble les valeurs de mêmes clés */
const sortAndShuffle = (mappedDatasets: MappedDatasetArray): MappedDataset =>
  mappedDatasets.reduce((acc: MappedDataset, cur: MappedDataset) => {
    cur.forEach(pair => {
      const existIndex = acc.findIndex(r => r[0] === pair[0]);
      if (existIndex === -1) acc = [...acc, pair];
      else acc[existIndex][1].push(...pair[1]);
    });
    return acc;
  }, []);

// -----
// reducers
// N.B: Les reducers sont notées 'async' afin de pouvoir être parallélisées à l'aide de 'Promise.all'
// -----

/** Applique une somme sur les valeurs de la Pair donnée */
const reducerSum = async (pair: Pair): Pair => [
  pair[0],
  pair[1].reduce((acc, cur) => acc + cur, 0),
];

/** Ne garde que le film le plus loué parmis les valeurs  */
const reducerMostRentedMovie = async (pair: Pair): Pair => [
  pair[0],
  pair[1]
    .sort(
      (a, b) =>
        pair[1].filter(v => v === a).length -
        pair[1].filter(v => v === b).length,
    )
    .pop(),
];

/** CAS 1: Montant des locations par client (mail) */
const rentsAmountByClient = async (dataset: Location[]): MappedDataset => {
  const dataChunks: Location[][] = splitDataset(dataset, 3);
  const mappedDatasets: MappedDatasetArray = await Promise.all(
    dataChunks.map(mapRentsAmountByClients),
  );
  const shuffledPairs: MappedDataset = sortAndShuffle(mappedDatasets);
  const reducedPairs: MappedDataset = await Promise.all(
    shuffledPairs.map(reducerSum),
  );

  console.log(reducedPairs);
  return reducedPairs;
};

/** CAS 2: Montant des locations par rating */
const rentsAmountByRating = async (dataset: Location[]): MappedDataset => {
  const dataChunks: Location[][] = splitDataset(dataset, 3);
  const mappedDatasets: MappedDatasetArray = await Promise.all(
    dataChunks.map(mapRentsAmountByRating),
  );
  const shuffledPairs: MappedDataset = sortAndShuffle(mappedDatasets);
  const reducedPairs: MappedDataset = await Promise.all(
    shuffledPairs.map(reducerSum),
  );

  console.log(reducedPairs);
  return reducedPairs;
};

/** CAS 3: Film le + loué par rating */
const mostRentedMovieByRating = async (dataset: Location[]): MappedDataset => {
  const dataChunks: Location[][] = splitDataset(dataset, 3);
  const mappedDatasets: MappedDatasetArray = await Promise.all(
    dataChunks.map(mapMostRentedByRating),
  );
  const shuffledPairs: MappedDataset = sortAndShuffle(mappedDatasets);
  const reducedPairs: MappedDataset = await Promise.all(
    shuffledPairs.map(reducerMostRentedMovie),
  );

  console.log(reducedPairs);
  return reducedPairs;
};

// -----
// main
// -----

rentsAmountByClient(DATASET);
rentsAmountByRating(DATASET);
mostRentedMovieByRating(DATASET);
