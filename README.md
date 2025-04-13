# workwise-assignment

# How this application decides what seat number to book?
1. We iterate each row first, calculating how many seats are free to book in that particular row.
2. We store this number in a array.
3. Then we traverse this array, comparing each element value with the number of seats the user want to book.
4. If the number of seats is greater then the value of that element for that index then move to the next element.
5. If the number of seats is less then the value of the element then save that row number.
6. Now that we have figured out in what row number, let's figure out at what seat number we should book our tickets.
7. We will traverse that row number and check if that element if booked or not, as soon as you encounter a unbooked seat. That is the seat number where we will start our booking.
8. Then we will count the natural number starting from that seat number we just calculated for the number of seats we want to book. And hurray, we got out answer.
9. But, there is a catch it may be possible that in no row we have same free seats that the user wants to book.
10. In that case, we will have to make them seat wherever the seats would be free.
11. For that, we will just run a simple traversal on our 2D seats matrix, and record every empty seat we encounter and then return it to the user.

# What Improvements that I wanted to do
1. I wanted to create a layer of abstraction on top of db.