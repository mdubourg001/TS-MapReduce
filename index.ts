import * as csv from 'csv-parser';
import * as fs from 'fs';

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

// -----
// utils
// -----

/** fn utilitaire: console.log et retourne la valeur fournie */
const tapLog = (x: any): any => {
  console.log(x);
  return x;
};

/** Lit un fichier CSV et retourne un tableau d'objets */
const getCSVData = async (filepath: string) =>
  new Promise(resolve => {
    const data = [];
    fs.createReadStream(filepath)
      .pipe(csv({ separator: ';' }))
      .on('data', row => data.push(row))
      .on('end', () => resolve(data));
  });

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
  pair[1].reduce((acc, cur) => acc + +cur, 0),
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

// -----
// use cases
// -----

/** CAS 1: Montant des locations par client (mail) */
const rentsAmountByClient = async (
  dataset: Location[],
  splitBy: number,
): MappedDataset => {
  const dataChunks: Location[][] = splitDataset(dataset, splitBy);
  const mappedDatasets: MappedDatasetArray = await Promise.all(
    dataChunks.map(mapRentsAmountByClients),
  );
  const shuffledPairs: MappedDataset = sortAndShuffle(mappedDatasets);
  const reducedPairs: MappedDataset = await Promise.all(
    shuffledPairs.map(reducerSum),
  );

  return reducedPairs;
};

/** CAS 2: Montant des locations par rating */
const rentsAmountByRating = async (
  dataset: Location[],
  splitBy: number,
): MappedDataset => {
  const dataChunks: Location[][] = splitDataset(dataset, splitBy);
  const mappedDatasets: MappedDatasetArray = await Promise.all(
    dataChunks.map(mapRentsAmountByRating),
  );
  const shuffledPairs: MappedDataset = sortAndShuffle(mappedDatasets);
  const reducedPairs: MappedDataset = await Promise.all(
    shuffledPairs.map(reducerSum),
  );

  return reducedPairs;
};

/** CAS 3: Film le + loué par rating */
const mostRentedMovieByRating = async (
  dataset: Location[],
  splitBy: number,
): MappedDataset => {
  const dataChunks: Location[][] = splitDataset(dataset, splitBy);
  const mappedDatasets: MappedDatasetArray = await Promise.all(
    dataChunks.map(mapMostRentedByRating),
  );
  const shuffledPairs: MappedDataset = sortAndShuffle(mappedDatasets);
  const reducedPairs: MappedDataset = await Promise.all(
    shuffledPairs.map(reducerMostRentedMovie),
  );

  return reducedPairs;
};

// -----
// main
// -----

const timeExecution = async (fn: Function) => {
  const start = new Date();
  await fn();
  console.log(`=> ${new Date() - start}ms`);
};

const main = async () => {
  const DATASET = await getCSVData('sakila_rental.csv');

  console.log('Running rentsAmountByClient (CAS 1)...');
  await timeExecution(() => rentsAmountByClient(DATASET, 10));

  console.log('Running rentsAmountByRating (CAS 2)...');
  await timeExecution(() => rentsAmountByRating(DATASET, 10));

  console.log('Running mostRentedMovieByRating (CAS 3)...');
  await timeExecution(() => mostRentedMovieByRating(DATASET, 10));
};

main();
