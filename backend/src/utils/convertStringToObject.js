export function convertStringToObject(input) {
    // Remove parentheses and whitespace, then split into parts
    if(typeof input === 'string') {
        const [key, value] = input.replace(/[()\s]/g, '').split(',');
  
        // Convert to object with integer key and boolean value
        return {
          [parseInt(key)]: value.toLowerCase() === 't'
        };
    }
}