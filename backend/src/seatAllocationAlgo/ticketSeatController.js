import findIndexCombinations from "../utils/findIndexCombination.js";
import getAbsoluteDifferences from "../utils/getAbsoluteDifference.js";
import minimumElement from "../utils/findMinimum.js";

class TicketSeatController {
  numberOfSeat;
  numberOfColumn;
  numberOfRows;
  leftOverSeat;

  constructor(responseObj, numberOfAllSeat, numberOfColumn) {
    if (!responseObj) return;

    this.numberOfSeat = numberOfAllSeat;
    this.numberOfColumn = numberOfColumn;
    this.numberOfRows = Math.ceil(this.numberOfSeat / this.numberOfColumn);
    this.leftOverSeat = this.numberOfSeat % this.numberOfColumn;

    let index = 1;
    this.seatMatrix = Array.from(
      { length: this.numberOfRows },
      (_, rowIndex) => {
        const seatsInRow =
          rowIndex === this.numberOfRows - 1 && this.leftOverSeat > 0
            ? this.leftOverSeat
            : this.numberOfColumn;

        return Array.from({ length: seatsInRow }, () => {
          const seatStatus = responseObj?.[index] ?? false;
          index++;
          return seatStatus === true;
        });
      }
    );
  }

  isSeatBooked(col, row) {
    return this.seatMatrix[row][col];
  }

  bookSeat(col, row) {
    // console.log("booking seat at", row, col);
    this.seatMatrix[row][col] = true;
  }

  getSeatNumber(col, row) {
    if (row === this.numberOfRows) {
      return (row - 1) * this.numberOfColumn + col + 1;
    } else {
      return row * this.numberOfColumn + col + 1;
    }
  }

  traverse2DMatrix() {
    this.seatMatrix.forEach((row, rowIndex) => {
      row.forEach((seatStatus, colIndex) => {
        console.log(
          `Seat at (Row ${rowIndex}, Column ${colIndex}): ${seatStatus}`
        );
      });
    });
  }

  getNumberOfSeatsAvailablePerRow() {
    const availableSeatsPerRow = Array(this.seatMatrix.length).fill(0);

    this.seatMatrix.forEach((row, rowIndex) => {
      row.forEach((_, seatIndex) => {
        if (!this.isSeatBooked(seatIndex, rowIndex)) {
          availableSeatsPerRow[rowIndex]++;
        }
      });
    });

    return availableSeatsPerRow;
  }

  getAllSeatStatus() {
    let responseObj = {},
      index = 0;
    this.seatMatrix.forEach((row, rowIndex) => {
      row.forEach((_, colIndex) => {
        index++;
        responseObj[index] = this.isSeatBooked(colIndex, rowIndex);
      });
    });

    return responseObj;
  }

  getSeatAllotment(numberOfSeat) {
    if (numberOfSeat <= this.numberOfColumn) {
      const seatNumberArray = [];
      const numberOfAvaiableSeatsPerRow =
        this.getNumberOfSeatsAvailablePerRow();

      // identify which row to book seats at
      let rowToBookTicketAt,
        numberOfAllSeat = 0;
      for (let i = 0; i < numberOfAvaiableSeatsPerRow.length; i++) {
        numberOfAllSeat += numberOfAvaiableSeatsPerRow[i];
        if (numberOfAvaiableSeatsPerRow[i] >= numberOfSeat) {
          rowToBookTicketAt = i;
          break;
        }
      }

      // if the number of seat is less then total number of seat, return undefine
      if (numberOfSeat > numberOfAllSeat) return undefined;

      if (rowToBookTicketAt === undefined) {
        // this is the case when you can't make everyone seat in a single row

        // finding all possible seat combination that can be sum up to numberOfSeat
        const possibleSeatCombination = findIndexCombinations(
          numberOfAvaiableSeatsPerRow,
          numberOfSeat
        );

        // finding the absolute difference between the possible seat combination, this will insure that the seat is booked are near to each other
        const absoluteDifference = getAbsoluteDifferences(
          possibleSeatCombination
        );

        // now we need to find the element which is nearest to the previous element means has least difference
        const minimumIndex = minimumElement(absoluteDifference);

        // now we will check that possible seat combination with the least difference
        const rowIndex = possibleSeatCombination[minimumIndex];

        // we will take the first element of the array, as from here we will start booking the seat
        const rowNumberToStartBooking = rowIndex[0];
        const row = this.seatMatrix[rowNumberToStartBooking];


        for (let rowIndex = rowNumberToStartBooking; rowIndex < this.seatMatrix.length; rowIndex++) {
          for(let colIndex = 0; colIndex < this.seatMatrix[rowIndex].length; colIndex++) {

            if (this.isSeatBooked(colIndex, rowIndex) === false) {
                this.bookSeat(colIndex, rowIndex);
                seatNumberArray.push(this.getSeatNumber(colIndex, rowIndex));
            }
          }

          if (seatNumberArray.length >= numberOfSeat) {
            break;
          }
        }

        // book the seats in the remaining rows
        // for (let rowIndex = 0; rowIndex < this.seatMatrix.length; rowIndex++) {
        //   const row = this.seatMatrix[rowIndex];
        //   for (let colIndex = 0; colIndex < row.length; colIndex++) {
        //     if (row[colIndex] === false) {
        //       if (seatNumberArray.length >= numberOfSeat) {
        //         break;
        //       }
        //       this.bookSeat(rowIndex, colIndex);
        //       seatNumberArray.push(this.getSeatNumber(rowIndex, colIndex));
        //     }
        //   }
        //   // Exit outer loop if the required number of seats is reached
        //   if (seatNumberArray.length >= numberOfSeat) {
        //     break;
        //   }
        // }

        return seatNumberArray;
      } else {
        // in this case you can make everyone seat in the same row

        // returning undefined in case no seat is left
        if (this.seatMatrix[rowToBookTicketAt] === undefined) return undefined;

        // identifying which seat to start booking
        let colIndex = 0;
        for (
          let col = 0;
          col < this.seatMatrix[rowToBookTicketAt].length;
          col++
        ) {
          if (!this.isSeatBooked(col, rowToBookTicketAt)) {
            colIndex = col;
            break;
          }
        }

        //returning the seatNumberArray
        for (let i = 0; i < numberOfSeat; i++) {
          this.bookSeat(colIndex + i, rowToBookTicketAt);
          seatNumberArray.push(
            this.getSeatNumber(colIndex + i, rowToBookTicketAt)
          );
        }
        return seatNumberArray;
      }
    } else return undefined;
  }
}

// Create mock response object with 80 seats
// const testArray = [5, 7, 4, 7, 6, 5, 4, 5, 6, 7, 4];
// const mockResponse = {};
// for (let i = 1; i <= 80; i++) {
//   mockResponse[i] = false;
// }

// // for testing purpose
// const NUMBER_OF_SEAT = 80;
// const SEATS_PER_ROW = 7;

// const ticketSystem = new TicketSeatController(
//   mockResponse,
//   NUMBER_OF_SEAT,
//   SEATS_PER_ROW
// );
// testArray.forEach((test, index) => {
//   for (let i = 0; i < test; i++) {
//     ticketSystem.bookSeat(i, index);
//   }
// });
// ticketSystem.traverse2DMatrix();
// console.log('available seats', ticketSystem.getNumberOfSeatsAvailablePerRow());
// console.log("seatArray", ticketSystem.getSeatAllotment(6));
// console.log('available seats', ticketSystem.getNumberOfSeatsAvailablePerRow());
// ticketSystem.traverse2DMatrix();

export default TicketSeatController;
