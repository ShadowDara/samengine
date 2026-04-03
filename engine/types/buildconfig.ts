// Generate the HTML File

export interface buildconfig {
    htmlhead: string
}

export function new_buildconfig(): buildconfig {
    return {
        htmlhead: "",
    }
}
