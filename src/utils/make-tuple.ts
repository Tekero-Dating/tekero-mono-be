export const makeTuple = (arr: string[]) => {
  const tuple = `(${arr.map((g) => `'${g}'`).join(', ')})`;
  return tuple;
};
