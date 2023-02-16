export function sum(array: number[]) {
    let result = 0;
    array.map((a: number) => {
        result += a;
        return a;
    });
    return result;
}
