// Debug Log Function
export const dlog =
    // (import.meta.env?.DEV ?? true) // Default true, falls undefined
    // ? (...args: any[]) => {
    //     const now = new Date();
    //     const time =
    //         `[${now.getHours().toString().padStart(2, "0")}:` +
    //         `${now.getMinutes().toString().padStart(2, "0")}:` +
    //         `${now.getSeconds().toString().padStart(2, "0")}.` +
    //         `${now.getMilliseconds().toString().padStart(3, "0")}]`;

    //     console.log(time, ...args);
    // }
    // :
    (...args: any[]) => { }; // Release: nichts loggen

// Dlog in Release Mode:
// export const dlog = () => {};
