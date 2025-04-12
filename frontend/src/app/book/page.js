"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { protectedClient } from "../apiClient";
import { MajorButton } from "@/components/button";

export default function Home() {
  const [seats, setSeats] = useState([]);
  const [numberOfSeats, setNumberOfSeats] = useState();
  const [currentBookedSeat, setCurrentBookedSeat] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const GET_ALL_SEAT_API_ENDPOINT = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/get-all-seats`;
  const BOOK_SEATS_API_ENDPOINT = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/book-seats`;
  const RESET_ALL_SEATS_API_ENDPOINT = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/reset-all-seats`;

  useEffect(() => {
    const fetchSeatStatus = async () => {
      try {
        const response = await protectedClient(GET_ALL_SEAT_API_ENDPOINT, {
          method: "GET",
        });

        if (response.seatStatus) {
          setSeats(Object.values(response.seatStatus));
        }

        if (response.currentBookedSeat) {
          setCurrentBookedSeat(response.currentBookedSeat);
        }

        if (!response.success) {
          if (response.message === "Session expired") {
            router.push("/");
          }
          setErrorMessage(parsedResponse.message);
        }
      } catch (error) {
        console.log("Something went wrong while caliing the api", error);
      }
    };
    fetchSeatStatus();
  }, []);

  const handleChange = (e) => {
    setErrorMessage("");
    const num = parseInt(e.target.value);
    if (Number.isInteger(num)) {
      setNumberOfSeats(num);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();

    if (numberOfSeats > 7) {
      setErrorMessage("Must enter less then 7");
      return;
    }
    try {
      const response = await protectedClient(BOOK_SEATS_API_ENDPOINT, {
        method: "POST",
        body: {
          numberOfSeats,
        },
      });

      if (!response.success) {
        if (response.message === "Session expired") {
          router.push("/");
        }
        setErrorMessage(response.message);
      }

      if (response.success) {
        if (response.seatStatus) {
          setSeats(Object.values(response.seatStatus));
        }

        if (response.currentBookedSeat) {
          setCurrentBookedSeat(response.currentBookedSeat);
        }
      }
    } catch (e) {
      console.log("error", e);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const response = await protectedClient(RESET_ALL_SEATS_API_ENDPOINT, {
        method: "GET",
      });
      setCurrentBookedSeat([]);
      if (response.seatStatus) {
        setSeats(Object.values(response.seatStatus));
      }
    } catch (e) {
      console.log("error", e);
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem('authToken');
    router.push("/");
  }

  return (
    <div className="w-screen h-screen relative flex">
        <div className='top-4 right-6 absolute'>
            <MajorButton onClick={handleLogOut} text='Log Out' />
        </div>
      <div className="w-[49%] h-screen flex items-center justify-center">
        <div className="p-10 grid grid-cols-7">
          {seats &&
            seats.map((seats, index) => {
              if (seats) {
                return (
                  <div
                    key={index}
                    className="m-1 flex justify-center items-center rounded-md w-10 h-10 bg-red-500"
                  >
                    {index + 1}
                  </div>
                );
              } else {
                return (
                  <div
                    key={index}
                    className="m-1 flex justify-center items-center rounded-md w-10 h-10 bg-green-500"
                  >
                    {index + 1}
                  </div>
                );
              }
            })}
        </div>
      </div>
      <div className="w-[49%] flex justify-center items-center h-screen">
        <div className="w-[50%]">
          <div className="flex gap-2.5">
            {currentBookedSeat &&
              currentBookedSeat.map((seats, index) => {
                return (
                  <div key={index} className="bg-amber-300 rounded-md p-2 px-3 mb-2">{seats}</div>
                );
              })}
          </div>
          <form>
            <div className="space-y-2">
                <label htmlFor="numberOfSeats" className="block text-sm font-medium text-gray-600">
                    Enter number of Seats to book:
                </label>
                <input
                    id="numberOfSeats"
                    name="numberOfSeats"
                    type="number"
                    autoComplete="name"
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                    placeholder="Enter number of Seats to book"
                    required
                    aria-required="true"
                />
            </div>
            {errorMessage && <p className="text-red-400 ">{errorMessage}</p>}
            <div className='flex gap-2 mt-5'>
                <MajorButton onClick={handleBook} text={'Book Seats'} />
                <MajorButton onClick={handleReset} text={'Reset Seats'} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
