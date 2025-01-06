export function generateCode(): string {
  const uniqueNumbers = new Set<number>();

  while (uniqueNumbers.size < 6) {
      const randomNum = Math.floor(Math.random() * 10); // Random number between 0 and 9
      uniqueNumbers.add(randomNum);
  }

  return Array.from(uniqueNumbers).join('');
}
