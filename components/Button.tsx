'use client';

import { ButtonProps, ButtonType } from "@/types/ButtonProps";
import { useRedirect } from "@/hooks/useRedirect";

export default function Button({
    type = ButtonType,
    style = '',
    label = '',
    url = '',
    className = '',
    ico = '',
}: ButtonProps) {
    const { redirectTo } = useRedirect()

    return (
        <button
            type={type}
            className={`${className}`}
            onClick={() => redirectTo(url)}
        >
            {ico && <span className="mr-2"> {ico}</span>}
            {label}
        </button>
    )
}