export default function getAbsoluteDifferences(arr) {
    return arr.map(sub => {
      let total = 0;
      for (let i = 1; i < sub.length; i++) {
        total += Math.abs(sub[i] - sub[i - 1]);
      }
      return total;
    });
  }