/**
 * Debug logger used by samengine internals.
 *
 * In the current release build this is intentionally a no-op, so calls can stay
 * in code without producing console output. The commented implementation above
 * shows the development logger that can be re-enabled when needed.
 */
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
