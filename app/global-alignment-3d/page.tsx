// app/global-alignment-3d/page.tsx
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
} from "@nextui-org/react";
import { useState } from "react";

import Matrix3DViz from "@/components/3dMatrixViz";

type Direction =
    | "xyz" // diagonal move in all 3 dimensions
    | "xy" // diagonal move in x-y plane
    | "xz" // diagonal move in x-z plane
    | "yz" // diagonal move in y-z plane
    | "x" // move along x-axis
    | "y" // move along y-axis
    | "z" // move along z-axis
    | null;
export type Cell = {
    score: number;
    direction: Direction;
    inAlignment?: boolean;
};

export default function GlobalAlignment() {
    const [seqX, setSeqX] = useState("AATTCCGG");
    const [seqY, setSeqY] = useState("AATTCCGG");
    const [seqZ, setSeqZ] = useState("ATC");
    const [matchScore, setMatchScore] = useState(1);
    const [mismatchScore, setMismatchScore] = useState(-1);
    const [gapScore, setGapScore] = useState(-2);

    // Create DP table WITHOUT column or row labels
    const createDPTable = () => {
        // Create 3D table with dimensions (Z+1) x (Y+1) x (X+1)
        const table: Cell[][][] = Array(seqZ.length + 1)
            .fill(null)
            .map(() =>
                Array(seqY.length + 1)
                    .fill(null)
                    .map(() =>
                        Array(seqX.length + 1)
                            .fill(null)
                            .map(() => ({
                                score: Number.MIN_SAFE_INTEGER,
                                direction: null,
                            })),
                    ),
            );

        // Set origin (0,0,0)
        table[0][0][0] = { score: 0, direction: null };

        // Fill x-axis (0,0,i)
        for (let i = 1; i <= seqX.length; i++) {
            table[0][0][i] = {
                score: table[0][0][i - 1].score + gapScore,
                direction: "x" as Direction,
            };
        }

        // Fill y-axis (0,j,0)
        for (let j = 1; j <= seqY.length; j++) {
            table[0][j][0] = {
                score: table[0][j - 1][0].score + gapScore,
                direction: "y" as Direction,
            };
        }

        // Fill z-axis (k,0,0)
        for (let k = 1; k <= seqZ.length; k++) {
            table[k][0][0] = {
                score: table[k - 1][0][0].score + gapScore,
                direction: "z" as Direction,
            };
        }

        // Fill xy-plane (0,j,i)
        for (let i = 1; i <= seqX.length; i++) {
            for (let j = 1; j <= seqY.length; j++) {
                const scores = [
                    {
                        score:
                            table[0][j - 1][i - 1].score +
                            (seqX[i - 1] === seqY[j - 1]
                                ? matchScore
                                : mismatchScore),
                        direction: "xy" as Direction,
                    },
                    {
                        score: table[0][j - 1][i].score + gapScore,
                        direction: "y" as Direction,
                    },
                    {
                        score: table[0][j][i - 1].score + gapScore,
                        direction: "x" as Direction,
                    },
                ];

                table[0][j][i] = scores.reduce((a, b) =>
                    a.score > b.score ? a : b,
                );
            }
        }

        // Fill xz-plane (k,0,i)
        for (let k = 1; k <= seqZ.length; k++) {
            for (let i = 1; i <= seqX.length; i++) {
                const scores = [
                    {
                        score:
                            table[k - 1][0][i - 1].score +
                            (seqX[i - 1] === seqZ[k - 1]
                                ? matchScore
                                : mismatchScore),
                        direction: "xz" as Direction,
                    },
                    {
                        score: table[k - 1][0][i].score + gapScore,
                        direction: "z" as Direction,
                    },
                    {
                        score: table[k][0][i - 1].score + gapScore,
                        direction: "x" as Direction,
                    },
                ];

                table[k][0][i] = scores.reduce((a, b) =>
                    a.score > b.score ? a : b,
                );
            }
        }

        // Fill yz-plane (k,j,0)
        for (let k = 1; k <= seqZ.length; k++) {
            for (let j = 1; j <= seqY.length; j++) {
                const scores = [
                    {
                        score:
                            table[k - 1][j - 1][0].score +
                            (seqY[j - 1] === seqZ[k - 1]
                                ? matchScore
                                : mismatchScore),
                        direction: "yz" as Direction,
                    },
                    {
                        score: table[k - 1][j][0].score + gapScore,
                        direction: "z" as Direction,
                    },
                    {
                        score: table[k][j - 1][0].score + gapScore,
                        direction: "y" as Direction,
                    },
                ];

                table[k][j][0] = scores.reduce((a, b) =>
                    a.score > b.score ? a : b,
                );
            }
        }

        // Fill the 3D space
        for (let z = 1; z <= seqZ.length; z++) {
            for (let y = 1; y <= seqY.length; y++) {
                for (let x = 1; x <= seqX.length; x++) {
                    const scores = [
                        // Single axis movements (x, y, z)
                        {
                            score:
                                table[z][y][x - 1].score + gapScore + gapScore,
                            direction: "x" as Direction,
                        },
                        {
                            score:
                                table[z][y - 1][x].score + gapScore + gapScore,
                            direction: "y" as Direction,
                        },
                        {
                            score:
                                table[z - 1][y][x].score + gapScore + gapScore,
                            direction: "z" as Direction,
                        },
                        // Plane movements (xy, xz, yz)
                        {
                            score:
                                table[z][y - 1][x - 1].score +
                                (seqX[x - 1] === seqY[y - 1]
                                    ? matchScore
                                    : mismatchScore) +
                                gapScore,
                            direction: "xy" as Direction,
                        },
                        {
                            score:
                                table[z - 1][y][x - 1].score +
                                (seqX[x - 1] === seqZ[z - 1]
                                    ? matchScore
                                    : mismatchScore) +
                                gapScore,
                            direction: "xz" as Direction,
                        },
                        {
                            score:
                                table[z - 1][y - 1][x].score +
                                (seqY[y - 1] === seqZ[z - 1]
                                    ? matchScore
                                    : mismatchScore) +
                                gapScore,
                            direction: "yz" as Direction,
                        },
                        // Back diagonal (xyz)
                        {
                            score:
                                table[z - 1][y - 1][x - 1].score +
                                (seqX[x - 1] === seqY[y - 1]
                                    ? matchScore
                                    : mismatchScore) +
                                (seqY[y - 1] === seqZ[z - 1]
                                    ? matchScore
                                    : mismatchScore) +
                                (seqX[x - 1] === seqZ[z - 1]
                                    ? matchScore
                                    : mismatchScore),
                            direction: "xyz" as Direction,
                        },
                    ];

                    table[z][y][x] = scores.reduce((a, b) =>
                        a.score > b.score ? a : b,
                    );
                }
            }
        }

        return table;
    };

    // Find best alignment and return both the table and aligned sequences
    function findBestAlignment(table: Cell[][][]): {
        table: Cell[][][];
        alignedSeqs: { x: string; y: string; z: string };
    } {
        let i = seqX.length;
        let j = seqY.length;
        let k = seqZ.length;

        // Arrays to store the aligned sequences
        let alignedX: string[] = [];
        let alignedY: string[] = [];
        let alignedZ: string[] = [];

        while (i !== 0 || j !== 0 || k !== 0) {
            table[k][j][i] = {
                ...table[k][j][i],
                inAlignment: true,
            };

            const direction = table[k][j][i].direction;

            switch (direction) {
                case "xyz":
                    alignedX.unshift(seqX[i - 1]);
                    alignedY.unshift(seqY[j - 1]);
                    alignedZ.unshift(seqZ[k - 1]);
                    i--;
                    j--;
                    k--;
                    break;
                case "xy":
                    alignedX.unshift(seqX[i - 1]);
                    alignedY.unshift(seqY[j - 1]);
                    alignedZ.unshift("-");
                    i--;
                    j--;
                    break;
                case "xz":
                    alignedX.unshift(seqX[i - 1]);
                    alignedY.unshift("-");
                    alignedZ.unshift(seqZ[k - 1]);
                    i--;
                    k--;
                    break;
                case "yz":
                    alignedX.unshift("-");
                    alignedY.unshift(seqY[j - 1]);
                    alignedZ.unshift(seqZ[k - 1]);
                    j--;
                    k--;
                    break;
                case "x":
                    alignedX.unshift(seqX[i - 1]);
                    alignedY.unshift("-");
                    alignedZ.unshift("-");
                    i--;
                    break;
                case "y":
                    alignedX.unshift("-");
                    alignedY.unshift(seqY[j - 1]);
                    alignedZ.unshift("-");
                    j--;
                    break;
                case "z":
                    alignedX.unshift("-");
                    alignedY.unshift("-");
                    alignedZ.unshift(seqZ[k - 1]);
                    k--;
                    break;
            }
        }

        table[0][0][0] = {
            ...table[0][0][0],
            inAlignment: true,
        };

        return {
            table,
            alignedSeqs: {
                x: alignedX.join(""),
                y: alignedY.join(""),
                z: alignedZ.join(""),
            },
        };
    }

    const { table: dpTable, alignedSeqs } = findBestAlignment(createDPTable());

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
        {
            key: "z",
            sequence: "Z",
            ...Object.fromEntries(
                alignedSeqs.z.split("").map((char, i) => [`pos${i}`, char]),
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-4 items-center">
            <div className="flex flex-col gap-4 w-full">
                <div className="space-y-4">
                    <Input
                        label="Sequence X"
                        placeholder="Enter first sequence"
                        value={seqX}
                        onChange={(e) => setSeqX(e.target.value)}
                    />
                    <Input
                        label="Sequence Y"
                        placeholder="Enter second sequence"
                        value={seqY}
                        onChange={(e) => setSeqY(e.target.value)}
                    />
                    <Input
                        label="Sequence Z"
                        placeholder="Enter third sequence"
                        value={seqZ}
                        onChange={(e) => setSeqZ(e.target.value)}
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

            {/* Add 3D visualization above the 2D table */}
            {seqX.length > 0 && seqY.length > 0 && (
                <Matrix3DViz
                    height={600}
                    matrix={dpTable}
                    seqX={seqX}
                    seqY={seqY}
                    seqZ={seqZ}
                    width={800}
                />
            )}

            {/* Add alignment table */}
            {seqX.length > 0 && seqY.length > 0 && seqZ.length > 0 && (
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
