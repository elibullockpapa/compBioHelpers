const parseBlosum = (blosum: string[]): number => {
    return blosum.length;
}

const combinationBlosumColumn = (blosum: string[]): number => {
    return factorial(blosum.length) / (factorial(2) * factorial(blosum.length - 2));
}

function factorial(n: number): number {
   let fact: number = 1;
   for (let i = 1; i <= n; i++) {
       fact *= i;
   }
   return fact;

}

export { parseBlosum, combinationBlosumColumn };
