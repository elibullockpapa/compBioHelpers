// app/global-alignment-2d/page.tsx
"use client";
import {
    Input,
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
    getKeyValue,
    Card,
    CardFooter,
} from "@nextui-org/react";
import { useState } from "react";

type Direction = "diagonal" | "up" | "left" | null;
type Cell = {
    score: number;
    direction: Direction;
    inAlignment?: boolean;
};

export default function GlobalAlignment() {
    const [seqX, setSeqX] = useState("GTCGACGCA");
    const [seqY, setSeqY] = useState("GATTACA");
    const [matchScore, setMatchScore] = useState(1);
    const [mismatchScore, setMismatchScore] = useState(-1);
    const [gapScore, setGapScore] = useState(-2);

    // Create DP table WITHOUT column or row labels
    const createDPTable = () => {
        // Set default values to minimum integer value
        // Note: seqX is the width of the table, seqY is the height of the table
        const table: Cell[][] = Array(seqY.length + 1)
            .fill(null)
            .map(() =>
                Array(seqX.length + 1).fill({
                    score: Number.MIN_SAFE_INTEGER,
                    direction: null,
                }),
            );

        // Set 0,0
        table[0][0] = { score: 0, direction: null };

        // Fill up row 0 by incrementing by gap score
        for (let column = 1; column <= seqX.length; column++) {
            table[0][column] = {
                score: table[0][column - 1].score + gapScore,
                direction: "left",
            };
        }

        // Fill column 0
        for (let row = 1; row <= seqY.length; row++) {
            table[row][0] = {
                score: table[row - 1][0].score + gapScore,
                direction: "up",
            };
        }

        // Fill in the dp table row-wise
        for (let column = 1; column <= seqX.length; column++) {
            for (let row = 1; row <= seqY.length; row++) {
                const upAndLeft = table[row - 1][column - 1].score;
                const left = table[row][column - 1].score;
                const up = table[row - 1][column].score;

                // Get score for moving diagonally
                const diagonalScore =
                    seqX[column - 1] === seqY[row - 1]
                        ? upAndLeft + matchScore
                        : upAndLeft + mismatchScore;

                // Get score for moving down
                const downScore = up + gapScore;

                // Get score for moving right
                const rightScore = left + gapScore;

                // Find best score and corresponding direction
                const scores = [
                    {
                        score: diagonalScore,
                        direction: "diagonal" as Direction,
                    },
                    { score: downScore, direction: "up" as Direction },
                    { score: rightScore, direction: "left" as Direction },
                ];
                const best = scores.reduce((a, b) =>
                    a.score > b.score ? a : b,
                );

                table[row][column] = best;
            }
        }

        return table;
    };

    // Function to do the backtrace and get the best alignment
    function findBestAlignment(table: Cell[][]): {
        table: Cell[][];
        alignedSeqs: { x: string; y: string };
    } {
        let seqXIndex = seqX.length;
        let seqYIndex = seqY.length;

        // Arrays to store the aligned sequences
        let alignedX: string[] = [];
        let alignedY: string[] = [];

        while (seqXIndex !== 0 || seqYIndex !== 0) {
            table[seqYIndex][seqXIndex] = {
                ...table[seqYIndex][seqXIndex],
                inAlignment: true,
            };

            const direction = table[seqYIndex][seqXIndex].direction;

            if (direction === "diagonal") {
                alignedX.unshift(seqX[seqXIndex - 1]);
                alignedY.unshift(seqY[seqYIndex - 1]);
                seqXIndex--;
                seqYIndex--;
            } else if (direction === "up") {
                alignedX.unshift("-");
                alignedY.unshift(seqY[seqYIndex - 1]);
                seqYIndex--;
            } else if (direction === "left") {
                alignedX.unshift(seqX[seqXIndex - 1]);
                alignedY.unshift("-");
                seqXIndex--;
            }
        }

        table[0][0] = {
            ...table[0][0],
            inAlignment: true,
        };

        return {
            table,
            alignedSeqs: {
                x: alignedX.join(""),
                y: alignedY.join(""),
            },
        };
    }

    // Create columns array
    const columns = [
        { key: "side", label: "" },
        { key: "gap", label: "-" },
        ...seqX.split("").map((char, index) => ({
            key: `char-${index}`,
            label: char,
        })),
    ];

    // Create rows array
    const { table: dpTable, alignedSeqs } = findBestAlignment(createDPTable());
    const rows = ["-", ...seqY.split("")].map((char, i) => ({
        key: `row-${i}`,
        side: char,
        gap: {
            score: dpTable[i][0].score,
            inAlignment: dpTable[i][0].inAlignment,
        },
        ...Array(seqX.length)
            .fill(0)
            .reduce(
                (acc, _, j) => ({
                    ...acc,
                    [`char-${j}`]: {
                        score: dpTable[i][j + 1].score,
                        inAlignment: dpTable[i][j + 1].inAlignment,
                    },
                }),
                {},
            ),
    }));

    // Create columns and rows for the alignment table
    const alignmentColumns = [
        { key: "sequence", label: "Sequence" },
        ...Array.from({ length: alignedSeqs.x.length }, (_, i) => ({
            key: `pos${i}`,
            label: (i + 1).toString(),
        })),
    ];

    const alignmentRows = [
        {
            key: "x",
            sequence: "X",
            ...Object.fromEntries(
                alignedSeqs.x.split("").map((char, i) => [`pos${i}`, char]),
            ),
        },
        {
            key: "y",
            sequence: "Y",
            ...Object.fromEntries(
                alignedSeqs.y.split("").map((char, i) => [`pos${i}`, char]),
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
                <div className="space-y-4">
                    <Input
                        label="Sequence 1"
                        placeholder="Enter first sequence"
                        value={seqX}
                        onChange={(e) => setSeqX(e.target.value)}
                    />
                    <Input
                        label="Sequence 2"
                        placeholder="Enter second sequence"
                        value={seqY}
                        onChange={(e) => setSeqY(e.target.value)}
                    />
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <Input
                            label="Match Score"
                            placeholder="Score for matching characters"
                            type="number"
                            value={matchScore.toString()}
                            onChange={(e) =>
                                setMatchScore(Number(e.target.value))
                            }
                        />
                        <Input
                            label="Mismatch Score"
                            placeholder="Score for mismatching characters"
                            type="number"
                            value={mismatchScore.toString()}
                            onChange={(e) =>
                                setMismatchScore(Number(e.target.value))
                            }
                        />
                        <Input
                            label="Gap Score"
                            placeholder="Score for gaps"
                            type="number"
                            value={gapScore.toString()}
                            onChange={(e) =>
                                setGapScore(Number(e.target.value))
                            }
                        />
                    </div>
                </div>
            </div>

            {/* Show DP Table when sequences have lengths above 0*/}
            <div className="text-lg font-medium">DP Table</div>
            {seqX.length > 0 && seqY.length > 0 ? (
                <Table aria-label="Global alignment table">
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
                                    <TableCell
                                        className={
                                            columnKey !== "side" &&
                                            getKeyValue(item, columnKey)
                                                .inAlignment
                                                ? "bg-primary-100"
                                                : ""
                                        }
                                    >
                                        {columnKey === "side"
                                            ? getKeyValue(item, columnKey)
                                            : getKeyValue(item, columnKey)
                                                  .score}
                                    </TableCell>
                                )}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            ) : (
                <Card className="bg-warning-50 border-warning-200 border-2">
                    <CardFooter className="flex items-center gap-2 px-4 py-3">
                        <p className="text-warning-700 font-medium">
                            Enter sequences to see the DP table!
                        </p>
                    </CardFooter>
                </Card>
            )}

            {/* Add alignment table */}
            <div className="text-lg font-medium">Alignment Table</div>
            {seqX.length > 0 && seqY.length > 0 && (
                <Table aria-label="Sequence alignment table">
                    <TableHeader columns={alignmentColumns}>
                        {(column) => (
                            <TableColumn key={column.key}>
                                {column.label}
                            </TableColumn>
                        )}
                    </TableHeader>
                    <TableBody items={alignmentRows}>
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
            )}
        </div>
    );
}
