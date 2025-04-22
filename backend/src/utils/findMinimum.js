export default function minimumElement(arr) {
    let min = 0;
    for(let i = 0; i < arr.length; i++) {
        if(arr[i] < arr[min]) {
            min = i;
        }
    }
    
    return min;
}