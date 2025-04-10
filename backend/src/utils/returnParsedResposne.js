import { convertStringToObject } from "./convertStringToObject.js";

export function returnParsedResponse(input) {
    let parsedObject = {};
    input.rows.forEach((obj) => {
        parsedObject = { ...parsedObject, ...convertStringToObject(obj.row) };
    });

    return parsedObject;
}