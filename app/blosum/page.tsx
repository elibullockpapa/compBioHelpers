// app/blosum/page.tsx
"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
    Button,
    getKeyValue,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Textarea,
    Input,
} from "@nextui-org/react";
import { Tabs, Tab } from "@nextui-org/react";

// Parent component that holds the state and manages the tabs
export default function Blosum() {
    const [inputData, setInputData] = useState<string>("");
    const [blocks, setBlocks] = useState<string[][][]>([]);
    const [qValues, setQValues] = useState<
        { letter: string; qValue: number; fraction: string }[]
    >([]);
    const [pValuesMatrix, setPValuesMatrix] = useState<number[][]>([]);
    const [currentBlock, setCurrentBlock] = useState<string>("ABC\nDEF\nABC");

    // Calculate Q values and combinations when blocks change
    useMemo(() => {
        if (blocks.length > 0) {
            // calculateQValues();
            // calculateQValuesCombinations();
        }
    }, [blocks]);

    return (
        <Tabs aria-label="BLOSUM Calculator">
            <Tab key="input" title="Input Data">
                <InputDataTab
                    blocks={blocks}
                    currentBlock={currentBlock}
                    setBlocks={setBlocks}
                    setCurrentBlock={setCurrentBlock}
                    setInputData={setInputData}
                />
            </Tab>
            <Tab key="qvalues" title="Q Values">
                {blocks.length > 0 && (
                    <QValuesComponent
                        blocks={blocks}
                        qValues={qValues}
                        setQValues={setQValues}
                    />
                )}
            </Tab>
            <Tab key="pvaluesmatrix" title="P values matrix">
                {qValues.length > 0 && (
                    <PValuesMatrixTab
                        blocks={blocks}
                        qValues={qValues}
                        setPValues={setPValuesMatrix}
                    />
                )}
            </Tab>
            <Tab key="blosumtable" title="BLOSUM Table">
                {qValues.length > 0 && pValuesMatrix.length > 0 && (
                    <BlosumTableTab qValues={qValues} pValues={pValuesMatrix} />
                )}
            </Tab>
        </Tabs>
    );
}

function InputDataTab({
    blocks,
    setBlocks,
    currentBlock,
    setCurrentBlock,
    setInputData,
}: {
    blocks: string[][][];
    setBlocks: React.Dispatch<React.SetStateAction<string[][][]>>;
    currentBlock: string;
    setCurrentBlock: React.Dispatch<React.SetStateAction<string>>;
    setInputData: React.Dispatch<React.SetStateAction<string>>;
}) {
    // Create columns array for each block
    const getColumns = (block: string[][]) => [
        ...block[0].map((_, index) => ({
            key: `col-${index}`,
            label: `Column ${index + 1}`,
        })),
    ];

    // Create rows array for each block
    const getRows = (block: string[][]) =>
        block.map((row, rowIndex) => ({
            key: `row-${rowIndex}`,
            ...row.reduce(
                (acc, cell, cellIndex) => ({
                    ...acc,
                    [`col-${cellIndex}`]: cell,
                }),
                {},
            ),
        }));

    // Takes in data like "AAA BBB" or "AAA\nBBB" and converts it to [["A", "A", "A"], ["B", "B", "B"]]
    const addBlock = () => {
        if (currentBlock.trim()) {
            const newBlock = currentBlock
                .trim()
                .split(/\s+/)
                .map((word) => word.split(""));

            setBlocks([...blocks, newBlock]);
            setCurrentBlock("");

            // Update the entire blocks data
            const updatedBlocks = [...blocks, newBlock];

            setInputData(
                updatedBlocks
                    .map((block) => block.map((row) => row.join("")).join("\n"))
                    .join("\n\n"),
            );
        }
    };

    const addHomework1Data = () => {
        const block1 = [
            ["A", "B", "C", "D", "A"],
            ["A", "B", "C", "D", "A"],
            ["B", "B", "C", "D", "A"],
            ["A", "A", "C", "D", "A"],
            ["C", "B", "A", "D", "A"],
            ["A", "A", "C", "A", "A"],
        ];
        const block2 = [
            ["B", "B", "C"],
            ["B", "B", "C"],
            ["B", "C", "C"],
            ["C", "B", "C"],
            ["B", "B", "D"],
        ];
        const block3 = [
            ["A", "A", "A", "A"],
            ["D", "B", "B", "B"],
            ["B", "A", "A", "A"],
            ["A", "D", "B", "A"],
        ];
        const newBlocks = [block1, block2, block3];

        setBlocks([...blocks, ...newBlocks]);
        setInputData(
            [...blocks, ...newBlocks]
                .map((block) => block.map((row) => row.join("")).join("\n"))
                .join("\n\n"),
        );
        setCurrentBlock("");
    };

    return (
        <>
            {/* Input for the block */}
            <Textarea
                label="Enter BLOSUM block"
                minRows={5}
                placeholder="Enter block data with each character representing a cell" // e.g., AAA\nCCC\nGGG
                value={currentBlock}
                onChange={(e) => setCurrentBlock(e.target.value)}
            />

            {/* Button to add the block */}
            <Button className="mt-2 mr-2" onClick={addBlock}>
                Add Block
            </Button>

            {/* Button to add Homework 1 data */}
            <Button className="mt-2" onClick={addHomework1Data}>
                Add Homework 1 Data
            </Button>

            {/* Updated block display */}
            {blocks.map((block, blockIndex) => (
                <div key={blockIndex} className="mb-4">
                    <Table aria-label={`BLOSUM Block ${blockIndex + 1}`}>
                        <TableHeader columns={getColumns(block)}>
                            {(column) => (
                                <TableColumn key={column.key}>
                                    {column.label}
                                </TableColumn>
                            )}
                        </TableHeader>
                        <TableBody items={getRows(block)}>
                            {(item) => (
                                <TableRow key={item.key}>
                                    {(columnKey) => (
                                        <TableCell>
                                            {getKeyValue(item, columnKey)}
                                        </TableCell>
                                    )}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            ))}
            {blocks.length === 0 && <p>No blocks to display.</p>}
        </>
    );
}

// Q Values Tab Component
interface QValuesComponentProps {
    blocks: string[][][]; // 3D array representing blocks of characters
    qValues: { letter: string; qValue: number; fraction: string }[]; // Array of letter-qValue pairs
    setQValues: React.Dispatch<
        React.SetStateAction<
            { letter: string; qValue: number; fraction: string }[]
        >
    >; // Function to update qValues
}

const QValuesComponent: React.FC<QValuesComponentProps> = ({
    blocks,
    qValues,
    setQValues,
}) => {
    // Function to calculate Q values for each unique letter in the blocks
    const calculateQValues = () => {
        // Calculate total number of cells across all blocks
        const totalCells = blocks.reduce(
            (sum, block) => sum + block.flat().length,
            0,
        );
        const letterCounts: { [key: string]: number } = {};

        // Count occurrences of each letter
        blocks.forEach((block) => {
            block.forEach((row) => {
                row.forEach((cell) => {
                    letterCounts[cell] = (letterCounts[cell] || 0) + 1;
                });
            });
        });

        // Calculate Q values and sort in descending order
        const calculatedQValues = Object.entries(letterCounts)
            .map(([letter, count]) => ({
                letter,
                qValue: count / totalCells,
                fraction: `${count}/${totalCells}`,
            }))
            .sort((a, b) => b.qValue - a.qValue);

        // Update state with calculated Q values
        setQValues(calculatedQValues);
    };

    return (
        <div className="mt-4">
            <h2 className="text-xl font-bold mb-2">Q Values</h2>
            <Button className="mb-2" onClick={calculateQValues}>
                Calculate Q Values
            </Button>
            {qValues.length > 0 ? (
                <Table aria-label="Q Values Table">
                    <TableHeader>
                        <TableColumn>Letter</TableColumn>
                        <TableColumn>Q Value (Fraction)</TableColumn>
                        <TableColumn>Q Value (Decimal)</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {qValues.map(({ letter, qValue, fraction }) => (
                            <TableRow key={letter}>
                                <TableCell>{letter}</TableCell>
                                <TableCell>{fraction}</TableCell>
                                <TableCell>{qValue.toFixed(4)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p>Click the button to calculate Q values.</p>
            )}
        </div>
    );
};

// P Values Matrix Tab Component
function PValuesMatrixTab({
    blocks,
    qValues,
    setPValues,
}: {
    blocks: string[][][];
    qValues: { letter: string; qValue: number }[];
    setPValues: (pValues: number[][]) => void;
}) {
    useEffect(() => {
        const pVals = calculatePValues();
        setPValues(pVals);
    }, [blocks, qValues]);

    const calculatePValues = (): number[][] => {
        const vocabSize = qValues.length;

        // Initialize pValues matrix with zeros
        const pValues: number[][] = Array.from({ length: vocabSize }, () =>
            Array(vocabSize).fill(0),
        );

        // Create a mapping from letter to its index
        const letterToIndex: { [key: string]: number } = {};
        qValues.forEach(({ letter }, index) => {
            letterToIndex[letter] = index;
        });

        let totalPairs = 0;

        // Iterate over each block
        blocks.forEach((block) => {
            const numSequences = block.length;
            const numPositions = block[0].length;

            // Iterate over each position (column)
            for (let pos = 0; pos < numPositions; pos++) {
                const columnLetters: string[] = [];

                // Collect letters in the current column
                for (let seqIndex = 0; seqIndex < numSequences; seqIndex++) {
                    const letter = block[seqIndex][pos];
                    if (letterToIndex.hasOwnProperty(letter)) {
                        columnLetters.push(letter);
                    }
                }

                const columnLength = columnLetters.length;

                // Skip columns with less than 2 letters
                if (columnLength < 2) continue;

                // Calculate total possible pairs in the column
                const pairsInColumn = (columnLength * (columnLength - 1)) / 2;
                totalPairs += pairsInColumn;

                // Count occurrences of each letter in the column
                const letterCounts: number[] = Array(vocabSize).fill(0);
                columnLetters.forEach((letter) => {
                    const index = letterToIndex[letter];
                    letterCounts[index]++;
                });

                // Calculate pair counts
                for (let i = 0; i < vocabSize; i++) {
                    const countX = letterCounts[i];
                    if (countX < 1) continue;

                    // Pairs where x = y
                    pValues[i][i] += (countX * (countX - 1)) / 2;

                    // Pairs where x != y
                    for (let j = i + 1; j < vocabSize; j++) {
                        const countY = letterCounts[j];
                        if (countY < 1) continue;

                        const pairsXY = countX * countY;
                        pValues[i][j] += pairsXY;
                        pValues[j][i] += pairsXY;
                    }
                }
            }
        });

        // Normalize counts to probabilities
        if (totalPairs === 0) {
            return pValues;
        }

        for (let i = 0; i < vocabSize; i++) {
            for (let j = 0; j < vocabSize; j++) {
                pValues[i][j] /= totalPairs;
            }
        }

        return pValues;
    };

    const pValues = calculatePValues();

    // Create columns array
    const columns = [
        { key: "letter", label: "Letter" },
        ...qValues.map(({ letter }) => ({
            key: `col-${letter}`,
            label: letter,
        })),
    ];

    // Create rows array with only lower triangle values
    const rows = qValues.map(({ letter: rowLetter }, rowIndex) => {
        const row: any = { key: `row-${rowLetter}`, letter: rowLetter };

        qValues.forEach(({ letter: colLetter }, colIndex) => {
            if (colIndex <= rowIndex) {
                row[`col-${colLetter}`] = pValues[rowIndex][colIndex].toFixed(4);
            } else {
                row[`col-${colLetter}`] = ""; // Empty cell for upper triangle
            }
        });

        return row;
    });

    return (
        <div className="mt-4">
            <h2 className="text-xl font-bold mb-2">P Values Matrix</h2>
            <Table aria-label="P Values Matrix Table">
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn key={column.key}>
                            {column.label}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={rows}>
                    {(item) => (
                        <TableRow key={item.key}>
                            {(columnKey) => {
                                if (columnKey === "letter") {
                                    // Always render the letter column
                                    return <TableCell>{item[columnKey]}</TableCell>;
                                } else {
                                    const colLetter = (columnKey as string).replace("col-", "");
                                    const colIndex = qValues.findIndex(
                                        (q) => q.letter === colLetter
                                    );
                                    const rowIndex = qValues.findIndex(
                                        (q) => q.letter === item.letter
                                    );

                                    if (colIndex <= rowIndex) {
                                        // Render cell for lower triangle
                                        return (
                                            <TableCell>{item[columnKey]}</TableCell>
                                        );
                                    } else {
                                        // Render empty cell for upper triangle
                                        return <TableCell>&nbsp;</TableCell>;
                                    }
                                }
                            }}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

// BLOSUM Table Tab Component
function BlosumTableTab({
    qValues,
    pValues,
}: {
    qValues: { letter: string; qValue: number }[];
    pValues: number[][];
}) {
    const [lambdaInput, setLambdaInput] = useState<string>("1");
    const [blosumScores, setBlosumScores] = useState<number[][] | null>(null);

    // Function to calculate BLOSUM scores
    const calculateBlosumScores = (lambdaValue: number) => {
        const vocabSize = qValues.length;
        const scores: number[][] = Array.from({ length: vocabSize }, () =>
            Array(vocabSize).fill(0),
        );

        for (let i = 0; i < vocabSize; i++) {
            const qx = qValues[i].qValue;
            for (let j = 0; j <= i; j++) { // Note: j <= i for lower triangle
                const qy = qValues[j].qValue;
                const pxy = pValues[i][j];

                if (qx > 0 && qy > 0 && pxy > 0 && lambdaValue > 0) {
                    // Use natural logarithm
                    const score =
                        (1 / lambdaValue) * Math.log(pxy / (qx * qy));
                    scores[i][j] = score;
                    scores[j][i] = score; // Ensure symmetry
                } else {
                    scores[i][j] = 0;
                    scores[j][i] = 0;
                }
            }
        }

        setBlosumScores(scores);
    };

    // Create columns array
    const columns = [
        { key: "letter", label: "Letter" },
        ...qValues.map(({ letter }, index) => ({
            key: `col-${letter}`,
            label: letter,
        })),
    ];

    return (
        <div className="mt-4">
            <h2 className="text-xl font-bold mb-2">BLOSUM Table</h2>
            <div className="mb-4 flex items-end space-x-4">
                <Input
                    type="number"
                    label="Lambda Value"
                    value={lambdaInput}
                    onChange={(e) => setLambdaInput(e.target.value)}
                />
                <Button
                    onPress={() => {
                        const lambdaValue = parseFloat(lambdaInput);
                        if (!isNaN(lambdaValue) && lambdaValue > 0) {
                            calculateBlosumScores(lambdaValue);
                        } else {
                            alert(
                                "Please enter a valid positive number for lambda.",
                            );
                        }
                    }}
                >
                    Calculate
                </Button>
            </div>
            {blosumScores && (
                <Table aria-label="BLOSUM Table">
                    <TableHeader columns={columns}>
                        {(column) => (
                            <TableColumn key={column.key}>
                                {column.label}
                            </TableColumn>
                        )}
                    </TableHeader>
                    <TableBody>
                        {qValues.map(({ letter: rowLetter }, rowIndex) => (
                            <TableRow key={`row-${rowLetter}`}>
                                {columns.map((column, colIndex) => {
                                    const columnKey = column.key;
                                    if (columnKey === "letter") {
                                        return (
                                            <TableCell key={columnKey}>
                                                {rowLetter}
                                            </TableCell>
                                        );
                                    } else {
                                        // Extract column index from key
                                        const colLetter = columnKey.replace(
                                            "col-",
                                            "",
                                        );
                                        const colIndexActual = qValues.findIndex(
                                            (q) => q.letter === colLetter,
                                        );

                                        // Only display lower triangle
                                        if (colIndexActual <= rowIndex) {
                                            const score =
                                                blosumScores[rowIndex][colIndexActual];
                                            return (
                                                <TableCell key={columnKey}>
                                                    {score.toFixed(2)}
                                                </TableCell>
                                            );
                                        } else {
                                            return (
                                                <TableCell key={columnKey}>
                                                    {/* Empty cell */}
                                                </TableCell>
                                            );
                                        }
                                    }
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}

