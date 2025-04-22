export default function findIndexCombinations(arr, target) {
  const result = [];

  function dfs(start, pathIndices, pathValues) {
    const sum = pathValues.reduce((a, b) => a + b, 0);
    if (sum === target) {
      result.push([...pathIndices]);
      return;
    }
    if (sum > target) return;

    for (let i = start; i < arr.length; i++) {
      pathIndices.push(i);
      pathValues.push(arr[i]);
      dfs(i + 1, pathIndices, pathValues);
      pathIndices.pop();
      pathValues.pop();
    }
  }

  dfs(0, [], []);
  return result;
}
