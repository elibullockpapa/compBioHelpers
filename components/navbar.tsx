import {
    Navbar as NextUINavbar,
    NavbarContent,
    NavbarBrand,
} from "@nextui-org/navbar";
import { Link } from "@nextui-org/link";

import { ThemeSwitch } from "@/components/theme-switch";
import { GithubIcon } from "@/components/icons";

export const Navbar = () => {
    return (
        <NextUINavbar maxWidth="xl" position="sticky">
            <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
                <NavbarBrand>
                    <Link href="/" className="font-bold text-inherit">Comp Bio Helpers</Link>
                </NavbarBrand>
            </NavbarContent>

            <NavbarContent justify="end">
                <Link
                    isExternal
                    aria-label="GitHub"
                    href="https://github.com/elibullockpapa/compBioHelpers"
                >
                    <GithubIcon className="text-default-500" />
                </Link>
                <ThemeSwitch />
            </NavbarContent>
        </NextUINavbar>
    );
};