// app/blosum/page.tsx
"use client";
import React, { useState, useMemo } from "react";
import { Button, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Textarea } from "@nextui-org/react";
import { Tabs, Tab } from "@nextui-org/react";

// Parent component that holds the state and manages the tabs
export default function Blosum() {
    const [inputData, setInputData] = useState<string>("");
    const [blocks, setBlocks] = useState<string[][][]>([]);
    const [qValues, setQValues] = useState<{ letter: string; qValue: number; fraction: string }[]>([]);
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
                    setBlocks={setBlocks}
                    currentBlock={currentBlock}
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
                    />
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
    setInputData
}: {
    blocks: string[][][];
    setBlocks: React.Dispatch<React.SetStateAction<string[][][]>>;
    currentBlock: string;
    setCurrentBlock: React.Dispatch<React.SetStateAction<string>>;
    setInputData: React.Dispatch<React.SetStateAction<string>>;
}) {

    // Takes in data like "AAA BBB" or "AAA\nBBB" and converts it to [["A", "A", "A"], ["B", "B", "B"]]
    const addBlock = () => {
        if (currentBlock.trim()) {
            const newBlock = currentBlock.trim().split(/\s+/).map(word =>
                word.split('')
            );
            setBlocks([...blocks, newBlock]);
            setCurrentBlock("");

            // Update the entire blocks data
            const updatedBlocks = [...blocks, newBlock];
            setInputData(updatedBlocks.map(block => block.map(row => row.join('')).join('\n')).join('\n\n'));
        }
    };

    const addHomework1Data = () => {
        const block1 = [
            ['A', 'B', 'C', 'D', 'A'],
            ['A', 'B', 'C', 'D', 'A'],
            ['B', 'B', 'C', 'D', 'A'],
            ['A', 'A', 'C', 'D', 'A'],
            ['C', 'B', 'A', 'D', 'A'],
            ['A', 'A', 'C', 'A', 'A']
        ];
        const block2 = [
            ['B', 'B', 'C'],
            ['B', 'B', 'C'],
            ['B', 'C', 'C'],
            ['C', 'B', 'C'],
            ['B', 'B', 'D']
        ];
        const block3 = [
            ['A', 'A', 'A', 'A'],
            ['D', 'B', 'B', 'B'],
            ['B', 'A', 'A', 'A'],
            ['A', 'D', 'B', 'A']
        ];
        const newBlocks = [block1, block2, block3];
        setBlocks([...blocks, ...newBlocks]);
        setInputData([...blocks, ...newBlocks].map(block => block.map(row => row.join('')).join('\n')).join('\n\n'));
        setCurrentBlock("");
    };

    return (
        <>
            {/* Input for the block */}
            <Textarea
                label="Enter BLOSUM block"
                placeholder="Enter block data with each character representing a cell" // e.g., AAA\nCCC\nGGG
                value={currentBlock}
                onChange={(e) => setCurrentBlock(e.target.value)}
                minRows={5}
            />

            {/* Button to add the block */}
            <Button onClick={addBlock} className="mt-2 mr-2">Add Block</Button>

            {/* Button to add Homework 1 data */}
            <Button onClick={addHomework1Data} className="mt-2">Add Homework 1 Data</Button>

            {/* Display the blocks */}
            {blocks.map((block, blockIndex) => (
                <div key={blockIndex} className="mb-4">
                    <Table aria-label={`BLOSUM Block ${blockIndex + 1}`} hideHeader>
                        <TableHeader>
                            {block[0].map((_, columnIndex) => (
                                <TableColumn key={`${blockIndex}-${columnIndex}`}>Column {columnIndex + 1}</TableColumn>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {block.map((row, rowIndex) => (
                                <TableRow key={`${blockIndex}-${rowIndex}`}>
                                    {row.map((cell, cellIndex) => (
                                        <TableCell key={`${blockIndex}-${rowIndex}-${cellIndex}`}>{cell}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
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
    blocks: string[][][];  // 3D array representing blocks of characters
    qValues: { letter: string; qValue: number, fraction: string }[];  // Array of letter-qValue pairs
    setQValues: React.Dispatch<React.SetStateAction<{ letter: string; qValue: number, fraction: string }[]>>;  // Function to update qValues
}

const QValuesComponent: React.FC<QValuesComponentProps> = ({ blocks, qValues, setQValues }) => {

    // Function to calculate Q values for each unique letter in the blocks
    const calculateQValues = () => {
        // Calculate total number of cells across all blocks
        const totalCells = blocks.reduce((sum, block) => sum + block.flat().length, 0);
        const letterCounts: { [key: string]: number } = {};

        // Count occurrences of each letter
        blocks.forEach(block => {
            block.forEach(row => {
                row.forEach(cell => {
                    letterCounts[cell] = (letterCounts[cell] || 0) + 1;
                });
            });
        });

        // Calculate Q values and sort in descending order
        const calculatedQValues = Object.entries(letterCounts).map(([letter, count]) => ({
            letter,
            qValue: count / totalCells,
            fraction: `${count}/${totalCells}`
        })).sort((a, b) => b.qValue - a.qValue);

        // Update state with calculated Q values
        setQValues(calculatedQValues);
    };

    return (
        <div className="mt-4">
            <h2 className="text-xl font-bold mb-2">Q Values</h2>
            <Button onClick={calculateQValues} className="mb-2">Calculate Q Values</Button>
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
function PValuesMatrixTab({ blocks, qValues }: { blocks: string[][][], qValues: { letter: string; qValue: number }[] }) {
    const calculatePValues = () => {
        const vocabSize = qValues.length;
        const pValues: number[][] = Array(vocabSize).fill(0).map(() => Array(vocabSize).fill(0));
        const letterToIndex: { [key: string]: number } = {};
        qValues.forEach(({ letter }, index) => letterToIndex[letter] = index);

        let totalPairs = 0;

        // Count observed pairs and calculate total possible pairs
        blocks.forEach(block => {
            block.forEach(column => {
                const columnLength = column.length;
                const pairsInColumn = columnLength * (columnLength - 1);
                totalPairs += pairsInColumn;

                for (let i = 0; i < columnLength; i++) {
                    for (let j = i + 1; j < columnLength; j++) {
                        const index1 = letterToIndex[column[i]];
                        const index2 = letterToIndex[column[j]];
                        if (index1 === index2) {
                            pValues[index1][index2] += 1;
                        } else {
                            pValues[index1][index2] += 1;
                            pValues[index2][index1] += 1;
                        }
                    }
                }
            });
        });

        // Calculate probabilities
        for (let i = 0; i < vocabSize; i++) {
            for (let j = 0; j < vocabSize; j++) {
                pValues[i][j] /= totalPairs;
            }
        }

        return pValues;
    };

    const pValues = calculatePValues();

    return (
        <div className="mt-4">
            <h2 className="text-xl font-bold mb-2">P Values Matrix</h2>
            <Table aria-label="P Values Matrix Table">
                <TableHeader>
                    {[
                        <TableColumn key="letter">Letter</TableColumn>,
                        ...qValues.map(({ letter }) => (
                            <TableColumn key={letter}>{letter}</TableColumn>
                        ))
                    ]}
                </TableHeader>
                <TableBody>
                    {qValues.map(({ letter: rowLetter }, rowIndex) => (
                        <TableRow key={rowLetter}>
                            {[
                                <TableCell key={`rowLetter-${rowLetter}`}>{rowLetter}</TableCell>,
                                ...qValues.map(({ letter: colLetter }, colIndex) => (
                                    <TableCell key={`${rowLetter}-${colLetter}`}>
                                        {pValues[rowIndex][colIndex].toFixed(4)}
                                    </TableCell>
                                ))
                            ]}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}









