Object.defineProperty(exports, "__esModule", { value: true });
exports.combinationBlosumColumn = exports.parseBlosum = void 0;
var main = function () {
    var blosumData = ["A", "R", "N", "D", "C"];
    console.log("Parsed Blosum Length:", parseBlosum(blosumData));
    console.log("Combination Blosum Column:", combinationBlosumColumn(blosumData));
};
if (require.main === module) {
    main();
}
var parseBlosum = function (blosum) {
    return blosum.length;
};
exports.parseBlosum = parseBlosum;
var combinationBlosumColumn = function (blosum) {
    return factorial(blosum.length) / (factorial(2) * factorial(blosum.length - 2));
};
exports.combinationBlosumColumn = combinationBlosumColumn;
function factorial(n) {
    var fact = 1;
    for (var i = 1; i <= n; i++) {
        fact *= i;
    }
    return fact;
}
