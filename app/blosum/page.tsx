// app/blosum/page.tsx
"use client";
import React, { useState, useMemo } from "react";
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
                    <PValuesMatrixTab blocks={blocks} qValues={qValues} />
                )}
            </Tab>
            <Tab key="blosumtable" title="BLOSUM Table">
                <div>
                    <p>BLOSUM table calculation will be implemented here.</p>
                </div>
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
        console.log(totalCells);
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
}: {
    blocks: string[][][];
    qValues: { letter: string; qValue: number }[];
}) {
    const calculatePValues = () => {
        const vocabSize = qValues.length;
        const pValues: number[][] = Array.from({ length: vocabSize }, () =>
            Array(vocabSize).fill(0),
        );
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
                for (let seqIndex = 0; seqIndex < numSequences; seqIndex++) {
                    const letter = block[seqIndex][pos];
                    columnLetters.push(letter);
                }

                const columnLength = columnLetters.length;
                // Calculate total possible pairs in the column
                const pairsInColumn = (columnLength * (columnLength - 1)) / 2;
                totalPairs += pairsInColumn;

                // Count occurrences of each letter in the column
                const letterCounts: { [key: string]: number } = {};
                columnLetters.forEach((letter) => {
                    letterCounts[letter] = (letterCounts[letter] || 0) + 1;
                });

                // Calculate pairs for each combination of letters
                const letters = Object.keys(letterCounts);

                for (let i = 0; i < letters.length; i++) {
                    const letterX = letters[i];
                    const countX = letterCounts[letterX];
                    const indexX = letterToIndex[letterX];

                    // Pairs where x = y
                    const pairsXX = (countX * (countX - 1)) / 2;
                    pValues[indexX][indexX] += pairsXX;

                    for (let j = i + 1; j < letters.length; j++) {
                        const letterY = letters[j];
                        const countY = letterCounts[letterY];
                        const indexY = letterToIndex[letterY];

                        // Pairs where x ≠ y
                        const pairsXY = countX * countY;
                        pValues[indexX][indexY] += pairsXY;
                        pValues[indexY][indexX] += pairsXY; // Ensure symmetry
                    }
                }
            }
        });

        // Normalize counts to probabilities
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

    // Create rows array
    const rows = qValues.map(({ letter: rowLetter }, rowIndex) => ({
        key: `row-${rowLetter}`,
        letter: rowLetter,
        ...qValues.reduce(
            (acc, { letter: colLetter }, colIndex) => ({
                ...acc,
                [`col-${colLetter}`]: pValues[rowIndex][colIndex].toFixed(4),
            }),
            {},
        ),
    }));

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
    );
}
