import { Link } from "@nextui-org/link";
import { Card, CardBody } from "@nextui-org/card";
import { Tooltip } from "@nextui-org/tooltip";

type Tool = {
    name: string;
    icon: string;
    description: string;
    url: string;
}

export default function Home() {
    const tools: Tool[] = [
        {
            name: "Blossom",
            icon: "🌺",
            description: "Protein sequence alignment scoring matrix",
            url: "/blosum",
        },
        {
            name: "Global Alignment",
            icon: "🧬",
            description: "Align entire sequences end-to-end",
            url: "/global-alignment",
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4">
            {tools.map((tool) => (
                <Link href={tool.url} className="w-full h-40">
                    <Card isPressable className="w-full h-full">
                        <CardBody className="flex flex-col justify-center items-center">
                            <div className="text-4xl mb-2">{tool.icon}</div>
                            <div className="text-lg font-bold text-center">{tool.name}</div>
                        </CardBody>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
